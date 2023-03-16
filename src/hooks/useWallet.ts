import useWalletContext from "../context/hooks/useWalletContext";
import useKeystore from "./useKeystore";
import { useGlobalStore } from "@src/store/global";
import useTools from "./useTools";
import useLib from "./useLib";
import api from "@src/lib/api";
import BN from "bignumber.js";
import { getLocalStorage, notify, setLocalStorage } from "@src/lib/tools";
import Runtime from "@src/lib/Runtime";
import useQuery from "./useQuery";
import { useSettingStore } from "@src/store/settingStore";
import { SignatureMode, UserOperation } from "soul-wallet-lib";
import config from "@src/config";
import { GuardianItem } from "@src/lib/type";

export default function useWallet() {
    const { account, ethersProvider, getAccount, walletAddress } = useWalletContext();
    const { bundlerUrl } = useSettingStore();
    const { getGasPrice, getWalletType, getFeeCost, estimateUserOperationGas } = useQuery();
    const { getGuardianInitCode } = useTools();
    const { guardians } = useGlobalStore();
    const keystore = useKeystore();

    const { soulWalletLib } = useLib();

    const activateWallet = async (payToken: string, costOnly: boolean = false) => {
        const guardiansList = guardians && guardians.length > 0 ? guardians.map((item: any) => item.address) : [];

        const guardianInitCode = getGuardianInitCode(guardiansList);

        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

        const op = soulWalletLib.activateWalletOp(
            config.contracts.walletLogic,
            config.contracts.entryPoint,
            account,
            config.upgradeDelay,
            config.guardianDelay,
            guardianInitCode.address,
            "0x",
            maxFeePerGas,
            maxPriorityFeePerGas,
        );

        // TODO, need user's approve
        const approveData: any = [
            {
                token: config.tokens.usdc,
                spender: config.contracts.paymaster,
            },
        ];

        const approveCallData = soulWalletLib.Tokens.ERC20.getApproveCallData(approveData);

        op.callGasLimit = approveCallData.callGasLimit;
        op.callData = approveCallData.callData;

        // only get the cost
        if (costOnly) {
            return await getFeeCost(op, payToken === config.zeroAddress ? "" : payToken);
        } else {
            await directSignAndSend(op, payToken);
        }
    };

    const generateWalletAddress = async (address: string, guardiansList: string[], saveKey?: boolean) => {
        const guardianInitCode = getGuardianInitCode(guardiansList);

        const wAddress = soulWalletLib.calculateWalletAddress(
            config.contracts.walletLogic,
            config.contracts.entryPoint,
            address,
            config.upgradeDelay,
            config.guardianDelay,
            guardianInitCode.address,
        );

        if (saveKey) {
            await setLocalStorage("walletAddress", wAddress);
            getAccount();
        }

        return wAddress;
    };

    const addPaymasterData: any = async (op: any, payToken: string) => {
        // important todo, extract
        const { requireAmountInWei, requireAmount } = await getFeeCost(
            op,
            payToken === config.zeroAddress ? "" : payToken,
        );

        if (payToken !== config.zeroAddress) {
            const maxUSDC = requireAmountInWei.mul(config.maxCostMultiplier).div(100);

            const maxUSDCFormatted = BN(requireAmount).times(config.maxCostMultiplier).div(100).toFixed(4);

            const paymasterAndData = soulWalletLib.getPaymasterData(
                config.contracts.paymaster,
                config.tokens.usdc,
                maxUSDC,
            );

            console.log(`need ${maxUSDCFormatted} USDC`);

            return paymasterAndData;
        } else {
            // op.paymasterAndData = "0x";
            console.log(`need ${requireAmount} ETH`);
            return "0x";
        }
    };

    const initRecoverWallet = async (walletAddress: string, guardians: GuardianItem[], payToken: string) => {
        const nonce = await soulWalletLib.Utils.getNonce(walletAddress, ethersProvider);
        // const currentFee = await getGasPrice();
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

        const newOwner = await getLocalStorage("stagingAccount");

        const usePaymaster = payToken !== config.zeroAddress;

        const op = soulWalletLib.Guardian.transferOwner(
            walletAddress,
            nonce,
            usePaymaster ? config.contracts.paymaster : config.zeroAddress,
            new BN(maxFeePerGas).times(1.2).toFixed(0),
            new BN(maxPriorityFeePerGas).times(1.2).toFixed(0),
            newOwner,
        );

        if (!op) {
            throw new Error("recoveryOp is null");
        }

        op.paymasterAndData = await addPaymasterData(op, payToken);

        await estimateUserOperationGas(op);

        const guardiansList = guardians.map((item) => item.address);

        const guardianInitCode = getGuardianInitCode(guardiansList);

        const opHash = op.getUserOpHashWithTimeRange(
            config.contracts.entryPoint,
            config.chainId,
            guardianInitCode.address,
            SignatureMode.guardian,
        );

        console.log("op hash", opHash);
        const res: any = await api.recovery.create({
            chainId: config.chainId,
            entrypointAddress: config.contracts.entryPoint,
            guardianAddress: guardianInitCode.address,
            newOwner,
            guardians: guardiansList,
            userOp: JSON.parse(op.toJSON()),
            opHash,
        });

        if (res.code === 200) {
            await setLocalStorage("recoverOpHash", opHash);
        } else {
            throw new Error(res.msg);
        }
    };

    const recoverWallet = async (transferOp: any, signatureList: any, guardiansList: string[], opHash: string) => {
        const op = UserOperation.fromJSON(JSON.stringify(transferOp));
        // const actionName = "Recover Wallet";

        signatureList.forEach((item: any) => {
            // TODO, need to judge
            item.contract = false;
        });

        const guardianInitCode = getGuardianInitCode(guardiansList);

        const isGuardianDeployed = (await getWalletType(guardianInitCode.address)) === "contract";

        const guardianInfo = await soulWalletLib.Guardian.getGuardian(ethersProvider, walletAddress);

        if (guardianInfo?.currentGuardian !== guardianInitCode.address) {
            throw new Error("Guardian address not match");
        }

        const signature = soulWalletLib.Guardian.packGuardiansSignByInitCode(
            guardianInitCode.address,
            signatureList,
            isGuardianDeployed ? "0x" : guardianInitCode.initCode,
        );

        op.signature = signature;

        await Runtime.send("execute", {
            operation: op.toJSON(),
            opHash,
            bundlerUrl,
        });

        await keystore.replaceAddress();
    };

    const updateGuardian = async (guardiansList: string[], payToken: string) => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

        const nonce = await soulWalletLib.Utils.getNonce(walletAddress, ethersProvider);

        const guardianInitCode = getGuardianInitCode(guardiansList);
        const setGuardianOp = soulWalletLib.Guardian.setGuardian(
            walletAddress,
            guardianInitCode.address,
            nonce,
            "0x",
            maxFeePerGas,
            maxPriorityFeePerGas,
        );

        await directSignAndSend(setGuardianOp, payToken);
    };

    const directSignAndSend = async (op: any, payToken: string) => {
        op.paymasterAndData = await addPaymasterData(op, payToken);

        await estimateUserOperationGas(op);

        const opHash = op.getUserOpHashWithTimeRange(config.contracts.entryPoint, config.chainId, account);

        const signature = await keystore.sign(opHash);

        if (!signature) {
            throw new Error("Failed to sign");
        }

        console.log('sig', signature)

        op.signWithSignature(account, signature || "");

        await Runtime.send("execute", {
            operation: op.toJSON(),
            opHash,
            bundlerUrl,
        });
    };

    return {
        activateWallet,
        initRecoverWallet,
        recoverWallet,
        generateWalletAddress,
        updateGuardian,
        directSignAndSend,
    };
}
