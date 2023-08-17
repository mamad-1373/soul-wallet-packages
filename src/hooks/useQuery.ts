/**
 * Query data on chain
 */

import useWalletContext from "../context/hooks/useWalletContext";
import BN from "bignumber.js";
import { ethers } from "ethers";
import useSdk from "./useSdk";
import { addPaymasterAndData } from "@src/lib/tools";
import useConfig from "./useConfig";
import { useBalanceStore } from "@src/store/balance";

export default function useQuery() {
    const { ethersProvider } = useWalletContext();
    const { soulWallet } = useSdk();
    const { chainConfig } = useConfig();
    const { getTokenBalance } = useBalanceStore();

    const getEthPrice = async () => {
        // get price from coingecko
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        console.log("res", await res.json());
    };

    const getGasPrice = async () => {
        // if it's in the fixed price list, set fixed
        if (chainConfig.chainId === 421613 || chainConfig.chainId === 42161) {
            return {
                maxFeePerGas: `0x${ethers.parseUnits(chainConfig.defaultMaxFee, "gwei").toString(16)}`,
                maxPriorityFeePerGas: `0x${ethers.parseUnits(chainConfig.defaultMaxPriorityFee, "gwei").toString(16)}`,
            };
        }

        const feeData = await ethersProvider.getFeeData();
        if (chainConfig.support1559) {
            return {
                maxFeePerGas: `0x${feeData.maxFeePerGas?.toString(16)}`,
                maxPriorityFeePerGas: `0x${feeData.maxPriorityFeePerGas?.toString(16)}`,
            };
        } else {
            return {
                maxFeePerGas: `0x${feeData.gasPrice?.toString(16)}`,
                maxPriorityFeePerGas: `0x${feeData.gasPrice?.toString(16)}`,
            };
        }
    };

    const getPrefund = async (userOp: any, payToken: string) => {
        // get preFund
        const preFund = await soulWallet.preFund(userOp);

        console.log("prefund", preFund);

        if (preFund.isErr()) {
            throw new Error(preFund.ERR.message);
        }

        const requiredEth = BN(preFund.OK.missfund).shiftedBy(-18);

        // erc20
        if (payToken === ethers.ZeroAddress) {
            return {
                requiredAmount: requiredEth.toFixed(),
                userOp,
            };
        } else {
            // IMPORTANT TODO, get erc20 price
            getEthPrice();
            const erc20Price = 1853;
            return {
                // IMPORTANT TODO, not fixed -18
                requiredAmount: requiredEth.times(erc20Price).times(chainConfig.maxCostMultiplier).div(100).toFixed(),
                userOp,
            };
        }
    };

    const getFeeCost = async (userOp: any, payToken: string) => {
        // set 1559 fee
        const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();
        userOp.maxFeePerGas = maxFeePerGas;
        userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

        if (payToken && payToken !== ethers.ZeroAddress) {
            userOp.paymasterAndData = addPaymasterAndData(payToken, chainConfig.contracts.paymaster);
        }

        // get gas limit
        const gasLimit = await soulWallet.estimateUserOperationGas(userOp);

        if (gasLimit.isErr()) {
            throw new Error(gasLimit.ERR.message);
        }

        return {
            userOp,
            maxFeePerGas,
            maxPriorityFeePerGas,
        };
    };

    // const getWalletType = async (address: string) => {
    //     if (!verifyAddressFormat(address)) {
    //         return "";
    //     }
    //     const contractCode = await ethersProvider.getCode(address);
    //     return contractCode !== "0x" ? "contract" : "eoa";
    // };

    const refreshActivateStatus = () => {
        // refresh all activate status on specific chain
    };

    return {
        getGasPrice,
        getFeeCost,
        getPrefund,
    };
}
