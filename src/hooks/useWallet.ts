import useWalletContext from "../context/hooks/useWalletContext";
import useKeyring from "./useKeyring";
import { ethers } from "ethers";
import useSdk from "./useSdk";
import { useAddressStore } from "@src/store/address";
import Runtime from "@src/lib/Runtime";
import useQuery from "./useQuery";
import { useSettingStore } from "@src/store/settingStore";
import { useGuardianStore } from "@src/store/guardian";
import config from "@src/config";
import { GuardianItem } from "@src/lib/type";
import useKeystore from "./useKeystore";

export default function useWallet() {
    const { account, ethersProvider, getAccount, walletAddress } = useWalletContext();
    const {updateAddressItem} = useAddressStore();
    const {calcGuardianHash} = useKeystore();
    const { bundlerUrl } = useSettingStore();
    const { getGasPrice, getFeeCost} = useQuery();
    const {guardians, threshold} = useGuardianStore();
    const keystore = useKeyring();
    const { soulWallet } = useSdk();

    const activateWallet = async (payToken: string, paymasterApproved: boolean, estimateCost: boolean = false) => {

        const guardianHash = calcGuardianHash(guardians, threshold);

        const userOpRet = await soulWallet.createUnsignedDeployWalletUserOp(0, account, guardianHash);

        if (userOpRet.isErr()) {
            throw new Error(userOpRet.ERR.message);
        }

        const userOp = userOpRet.OK;

        if (estimateCost) {
            return await getFeeCost(userOp, payToken === config.zeroAddress ? "" : payToken);
        } else {
            await directSignAndSend(userOp, payToken);
            updateAddressItem(userOp.sender, {activated: true})
        }

        // const guardiansList = guardians && guardians.length > 0 ? guardians.map((item: any) => item.address) : [];

        // const guardianInitCode = getGuardianInitCode(guardiansList);

        // const op = soulWalletLib.activateWalletOp(
        //     config.contracts.walletLogic,
        //     config.contracts.entryPoint,
        //     account,
        //     config.upgradeDelay,
        //     config.guardianDelay,
        //     guardianInitCode.address,
        //     "0x",
        //     maxFeePerGas,
        //     maxPriorityFeePerGas,
        // );

        // if (paymasterApproved) {
        //     const approveData = config.assetsList
        //         .filter((item: any) => item.paymaster)
        //         .map((item: any) => ({
        //             token: item.address,
        //             spender: config.contracts.paymaster,
        //         }));

        //     const approveCallData = soulWalletLib.Tokens.ERC20.getApproveCallData(approveData);

        //     op.callGasLimit = approveCallData.callGasLimit;
        //     op.callData = approveCallData.callData;
        // }
    };
    // const addPaymasterData: any = async (op: any, payToken: string) => {
    //     const { requireAmountInWei, requireAmount } = await getFeeCost(
    //         op,
    //         payToken === config.zeroAddress ? "" : payToken,
    //     );

    //     if (payToken !== config.zeroAddress) {
    //         const maxUSD = BN(requireAmountInWei.toString()).times(config.maxCostMultiplier).div(100);

    //         const maxUSDFormatted = BN(requireAmount.toString()).times(config.maxCostMultiplier).div(100).toFixed(4);

    //         const paymasterAndData = soulWalletLib.getPaymasterData(config.contracts.paymaster, payToken, maxUSD);

    //         console.log(`need ${maxUSDFormatted} USD`);

    //         return { paymasterAndData, requireAmountInWei: maxUSD, requireAmount: maxUSDFormatted };
    //     } else {
    //         // op.paymasterAndData = "0x";
    //         console.log(`need ${requireAmount} ${config.chainToken}`);
    //         return { paymasterAndData: "0x", requireAmountInWei, requireAmount };
    //     }
    // };

    const initRecoverWallet = async (walletAddress: string, guardians: GuardianItem[], payToken: string) => {
        // const nonce = await soulWalletLib.Utils.getNonce(walletAddress, ethersProvider);
        // // const currentFee = await getGasPrice();
        // const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();
        // const newOwner = await getLocalStorage("stagingAccount");
        // const usePaymaster = payToken !== config.zeroAddress;
        // const op = soulWalletLib.Guardian.transferOwner(
        //     walletAddress,
        //     nonce,
        //     usePaymaster ? config.contracts.paymaster : config.zeroAddress,
        //     new BN(maxFeePerGas).times(1.2).toFixed(0),
        //     new BN(maxPriorityFeePerGas).times(1.2).toFixed(0),
        //     newOwner,
        // );
        // if (!op) {
        //     throw new Error("recoveryOp is null");
        // }
        // const { paymasterAndData, requireAmountInWei } = await addPaymasterData(op, payToken);
        // op.paymasterAndData = paymasterAndData;
        // await estimateUserOperationGas(op);
        // const guardiansList = guardians.map((item) => item.address);
        // const guardianInitCode = getGuardianInitCode(guardiansList);
        // const opHash = op.getUserOpHashWithTimeRange(
        //     config.contracts.entryPoint,
        //     config.chainId,
        //     guardianInitCode.address,
        //     SignatureMode.guardian,
        // );
        // console.log("op hash", opHash);
        // const res: any = await api.recovery.create({
        //     tokenAddress: payToken,
        //     amountInWei: requireAmountInWei.toString(),
        //     chainId: config.chainId,
        //     entrypointAddress: config.contracts.entryPoint,
        //     guardianAddress: guardianInitCode.address,
        //     newOwner,
        //     guardians: guardiansList,
        //     userOp: JSON.parse(op.toJSON()),
        //     opHash,
        // });
        // if (res.code === 200) {
        //     await setLocalStorage("recoverOpHash", opHash);
        // } else {
        //     throw new Error(res.msg);
        // }
    };

    const updateGuardian = async (guardiansList: string[], payToken: string) => {
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

        // const nonce = await soulWalletLib.Utils.getNonce(walletAddress, ethersProvider);

        // const guardianInitCode = getGuardianInitCode(guardiansList);
        // const setGuardianOp = soulWalletLib.Guardian.setGuardian(
        //     walletAddress,
        //     guardianInitCode.address,
        //     nonce,
        //     "0x",
        //     maxFeePerGas,
        //     maxPriorityFeePerGas,
        // );

        // await directSignAndSend(setGuardianOp, payToken);

        // await removeLocalStorage("recoverOpHash");
    };

    const directSignAndSend = async (userOp: any, payToken?: string) => {
        // set 1559 fee
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();
        userOp.maxFeePerGas = maxFeePerGas;
        userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

        // get gas limit
        const gasLimit = await soulWallet.estimateUserOperationGas(userOp);

        if (gasLimit.isErr()) {
            throw new Error(gasLimit.ERR.message);
        }

        // get preFund
        const preFund = await soulWallet.preFund(userOp);

        if (preFund.isErr()) {
            throw new Error(preFund.ERR.message);
        }

        const validAfter = Math.floor(Date.now() / 1000);
        const validUntil = validAfter + 3600;

        const packedUserOpHashRet = await soulWallet.packUserOpHash(userOp, validAfter, validUntil);

        if (packedUserOpHashRet.isErr()) {
            throw new Error(packedUserOpHashRet.ERR.message);
        }
        const packedUserOpHash = packedUserOpHashRet.OK;

        const signature = await keystore.sign(packedUserOpHash.packedUserOpHash);

        if (!signature) {
            throw new Error("Failed to sign");
        }

        const packedSignatureRet = await soulWallet.packUserOpSignature(signature, packedUserOpHash.validationData);

        if (packedSignatureRet.isErr()) {
            throw new Error(packedSignatureRet.ERR.message);
        }

        userOp.signature = packedSignatureRet.OK;

        await Runtime.send("execute", {
            userOp: JSON.stringify(userOp),
            bundlerUrl,
        });

        // const { paymasterAndData } = await addPaymasterData(op, payToken);

        // op.paymasterAndData = paymasterAndData;

        // await estimateUserOperationGas(op);

        // const opHash = op.getUserOpHashWithTimeRange(config.contracts.entryPoint, config.chainId, account);
    };

    const backupGuardiansOnChain = async (keystoreAddress: string, guardiansList: string[], threshold: number) => {

    };

    const backupGuardiansByEmail = async (keystoreAddress: string, guardiansList: string[], threshold: number) => {

    };

    const backupGuardiansByDownload = async (keystoreAddress: string, guardiansList: string[], threshold: number) => {
        // const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonToSave))}`;
        // const link = document.createElement("a");
        // link.setAttribute("href", dataStr);
        // link.setAttribute("target", "_blank");
        // link.setAttribute("download", generateJsonName("guardian"));
        // link.click();
    };

    return {
        activateWallet,
        initRecoverWallet,
        updateGuardian,
        directSignAndSend,
        backupGuardiansOnChain,
        backupGuardiansByEmail,
        backupGuardiansByDownload
    };
}
