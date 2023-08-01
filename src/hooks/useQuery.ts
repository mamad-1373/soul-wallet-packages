/**
 * Query data on chain
 */

import useWalletContext from "../context/hooks/useWalletContext";
import BN from "bignumber.js";
import { ethers } from "ethers";
import useTools from "./useTools";
import useLib from "./useLib";
import useErc20Contract from "@src/contract/useErc20Contract";
import { useBalanceStore } from "@src/store/balanceStore";
import useSoulWallet from "./useSoulWallet";
import config from "@src/config";

export default function useQuery() {
    const { walletAddress, web3, ethersProvider } = useWalletContext();
    const { setBalance } = useBalanceStore();
    const { soulWallet } = useSoulWallet();
    const erc20Contract = useErc20Contract();
    const { soulWalletLib, bundler } = useLib();

    const { verifyAddressFormat, safeParseUnits } = useTools();

    /**
     * Get token info by tokenAddress
     * @param tokenAddress
     */
    const getTokenByAddress = (tokenAddress: string) => {
        return config.assetsList.filter((item: any) => item.address === tokenAddress)[0];
    };

    const getEthBalance = async () => {
        const res = await web3.eth.getBalance(walletAddress);
        return new BN(res).shiftedBy(-18).toString();
    };

    const getBalances = async () => {
        if (!walletAddress) {
            return;
        }

        const ethBalance = await getEthBalance();
        setBalance(config.zeroAddress, ethBalance);

        // const erc20Balance = await erc20Contract.batchBalanceOf(
        //     config.assetsList.filter((item: any) => item.symbol !== config.chainToken).map((item: any) => item.address),
        // );

        // Object.keys(erc20Balance).forEach((key: string) => {
        //     const balanceRaw = erc20Balance[key].callsReturnContext[0].returnValues[0].hex;

        //     const balanceDecimal = erc20Balance[key].callsReturnContext[1].returnValues[0];

        //     setBalance(key, new BN(balanceRaw).shiftedBy(-balanceDecimal).toString());
        // });
    };

    const estimateUserOperationGas = async (userOp: any) => {
        // TODO, remove await bundler
        // const b = await bundler;
        // const estimateData: any = await b.eth_estimateUserOperationGas(userOp);
        // console.log("call gas limit", userOp.callGasLimit);
        // if (new BN(userOp.callGasLimit).isEqualTo(0)) {
        //     userOp.callGasLimit = estimateData.callGasLimit;
        // }
        // userOp.preVerificationGas = estimateData.preVerificationGas;
        // userOp.verificationGasLimit = estimateData.verificationGas;
    };

    const getGasPrice = async () => {
        if (config.support1559) {
            // if it's arb goerli, set fixed
            if (config.chainId === 421613) {
                return {
                    maxFeePerGas: config.defaultMaxFee,
                    maxPriorityFeePerGas: config.defaultMaxPriorityFee,
                };
            } else if (config.chainId === 42161) {
                return {
                    maxFeePerGas: config.defaultMaxFee,
                    maxPriorityFeePerGas: config.defaultMaxPriorityFee,
                };
            }

            const feeData = await ethersProvider.getFeeData();

            // const res: any = await soulWalletLib.Utils.suggestedGasFee.getEIP1559GasFees(config.chainId);

            // const baseFee = new BN(res.estimatedBaseFee).toFixed(3);
            const maxFeePerGas = new BN(feeData.maxFeePerGas?.toString() || "0").toFixed(3);
            const maxPriorityFeePerGas = new BN(feeData.maxPriorityFeePerGas?.toString() || "0").toFixed(3);

            return {
                maxFeePerGas: ethers.parseUnits(maxFeePerGas, 9).toString(),
                maxPriorityFeePerGas: ethers.parseUnits(maxPriorityFeePerGas, 9).toString(),
            };
        } else {
            const feeData = await ethersProvider.getFeeData();

            const feeRaw = feeData.gasPrice;

            return {
                maxFeePerGas: feeRaw?.toString() || "",
                maxPriorityFeePerGas: feeRaw?.toString() || "",
            };
        }
    };

    const getFeeCost = async (userOp: any, tokenAddress?: string) => {
        // set 1559 fee
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();
        userOp.maxFeePerGas = ethers.parseUnits(maxFeePerGas, "gwei");
        userOp.maxPriorityFeePerGas = ethers.parseUnits(maxPriorityFeePerGas, "gwei");

        // get gas limit
        const gasLimit = await soulWallet.estimateUserOperationGas(userOp);

        if (gasLimit.isErr()) {
            throw new Error(gasLimit.ERR.message);
        }

        // get preFund
        const preFund = await soulWallet.preFund(userOp);

        console.log('prefund is', preFund)

        if (preFund.isErr()) {
            throw new Error(preFund.ERR.message);
        }

        return {
            requireAmountInWei: 0n,
            requireAmount: 0n,
        };

        // userOp.paymasterAndData = tokenAddress || "0x";

        // await estimateUserOperationGas(userOp);

        // let _requiredPrefund = await userOp.requiredPrefund(ethersProvider, config.contracts.entryPoint);

        // let requiredPrefund;
        // if (userOp.paymasterAndData === "0x") {
        //     requiredPrefund = _requiredPrefund.requiredPrefund.sub(_requiredPrefund.deposit);
        // } else {
        //     requiredPrefund = _requiredPrefund.requiredPrefund;
        // }

        // const requiredFinalPrefund = requiredPrefund.gt(0) ? requiredPrefund : 0n;

        // console.log("requiredPrefund: ", ethers.formatEther(requiredFinalPrefund), config.chainToken);
        // if (!tokenAddress) {
        //     return {
        //         requireAmountInWei: requiredFinalPrefund,
        //         requireAmount: ethers.formatEther(requiredFinalPrefund),
        //     };
        // }

        // get USDC exchangeRate
        // const exchangePrice = await soulWalletLib.getPaymasterExchangePrice(
        //     ethersProvider,
        //     config.contracts.paymaster,
        //     tokenAddress,
        //     true,
        // );
        // const tokenDecimals = exchangePrice.tokenDecimals || 6;
        // // print price now
        // console.log(
        //     "exchangePrice: " + ethers.formatUnits(exchangePrice.price, exchangePrice.decimals),
        //     `USDC/${config.chainToken}`,
        // );

        // // get required USDC : (requiredPrefund/10^18) * (exchangePrice.price/10^exchangePrice.decimals)
        // const requiredUSDC = requiredFinalPrefund
        //     .mul(exchangePrice.price)
        //     .mul(BigNumber.from(10).pow(tokenDecimals))
        //     .div(BigNumber.from(10).pow(exchangePrice.decimals))
        //     .div(BigNumber.from(10).pow(18));
        // console.log("requiredUSDC: " + ethers.formatUnits(requiredUSDC, tokenDecimals), "USDC");

        // return {
        //     requireAmountInWei: requiredUSDC,
        //     requireAmount: ethers.formatUnits(requiredUSDC, tokenDecimals),
        // };
    };

    const getWalletType = async (address: string) => {
        if (!verifyAddressFormat(address)) {
            return "";
        }
        const contractCode = await web3.eth.getCode(address);
        return contractCode !== "0x" ? "contract" : "eoa";
    };

    return {
        getBalances,
        getEthBalance,
        getGasPrice,
        getFeeCost,
        getWalletType,
        getTokenByAddress,
        estimateUserOperationGas,
    };
}
