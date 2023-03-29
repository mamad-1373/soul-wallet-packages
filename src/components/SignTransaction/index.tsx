import React, { useState, forwardRef, useImperativeHandle, useEffect, Ref } from "react";
import BN from "bignumber.js";
import cn from "classnames";
import useLib from "@src/hooks/useLib";
import useQuery from "@src/hooks/useQuery";
import useWalletContext from "@src/context/hooks/useWalletContext";
import config from "@src/config";
import CostItem from "../CostItem";
import useTools from "@src/hooks/useTools";
import AddressIcon from "../AddressIcon";
import Button from "../Button";
import PageTitle from "../PageTitle";
import { TokenSelect } from "../TokenSelect";

enum SignTypeEn {
    Transaction,
    Message,
    Account,
}

const SignTransaction = (_: unknown, ref: Ref<any>) => {
    const { walletAddress = "" } = useWalletContext(); // ! check this
    const [keepModalVisible, setKeepModalVisible] = useState(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [loadingFee, setLoadingFee] = useState(false);
    const [actionName, setActionName] = useState<string>("");
    const [origin, setOrigin] = useState<string>("");
    const [promiseInfo, setPromiseInfo] = useState<any>({});
    const [decodedData, setDecodedData] = useState<any>({});
    const [signing, setSigning] = useState<boolean>(false);
    const [payToken, setPayToken] = useState(config.zeroAddress);
    const [feeCost, setFeeCost] = useState("");
    const [activeOperation, setActiveOperation] = useState("");
    const [signType, setSignType] = useState<SignTypeEn>();
    const [messageToSign, setMessageToSign] = useState("");
    const [activePaymasterData, setActivePaymasterData] = useState({});
    const { soulWalletLib } = useLib();
    const { decodeCalldata } = useTools();
    const { getFeeCost } = useQuery();

    useImperativeHandle(ref, () => ({
        async show(
            operation: any,
            _actionName: string,
            origin: string,
            keepVisible: boolean,
            _messageToSign: string = "",
        ) {
            setActionName(_actionName);
            setOrigin(origin);

            setKeepModalVisible(keepVisible || false);

            if (_actionName === "getAccounts") {
                setSignType(SignTypeEn.Account);
            } else if (_actionName === "signMessage" || _actionName === "signMessageV4") {
                setSignType(SignTypeEn.Message);
            } else {
                setSignType(SignTypeEn.Transaction);
            }

            if (operation) {
                setActiveOperation(operation);
                const callDataDecode = (await decodeCalldata(operation.callData))[0];
                setDecodedData(callDataDecode);
            }

            if (_messageToSign) {
                setMessageToSign(_messageToSign);
            }

            return new Promise((resolve, reject) => {
                setPromiseInfo({
                    resolve,
                    reject,
                });
                setVisible(true);
            });
        },
    }));

    const onReject = async () => {
        promiseInfo.reject();
        if (!keepModalVisible) {
            setVisible(false);
            setSigning(false);
        }
    };

    const onConfirm = async () => {
        setSigning(true);

        if (config.zeroAddress === payToken) {
            promiseInfo.resolve();
        } else {
            promiseInfo.resolve(activePaymasterData);
        }

        if (!keepModalVisible) {
            setVisible(false);
            setSigning(false);
        }
    };

    const onSign = async () => {
        promiseInfo.resolve();
    };

    const getFeeCostAndPaymasterData = async () => {
        setLoadingFee(true);
        setFeeCost("");

        // TODO, extract this for other functions
        const { requireAmountInWei, requireAmount } = await getFeeCost(
            activeOperation,
            payToken === config.zeroAddress ? "" : payToken,
        );

        if (config.zeroAddress === payToken) {
            setActivePaymasterData("");
            setFeeCost(`${requireAmount} ETH`);
        } else {
            const maxUSDC = requireAmountInWei.mul(config.maxCostMultiplier).div(100);

            const maxUSDCFormatted = BN(requireAmount).times(config.maxCostMultiplier).div(100).toFixed(4);

            const paymasterAndData = soulWalletLib.getPaymasterData(config.contracts.paymaster, payToken, maxUSDC);

            setActivePaymasterData(paymasterAndData);

            setFeeCost(`${maxUSDCFormatted} USDC`);
        }
        setLoadingFee(false);
    };

    useEffect(() => {
        if (!activeOperation || !payToken) {
            return;
        }
        getFeeCostAndPaymasterData();
    }, [payToken, activeOperation]);

    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col justify-between pb-6 text-base h-full z-20 absolute top-0 bottom-0 left-0 right-0 bg-white overflow-hidden",
                !visible && "hidden",
            )}
        >
            <div>
                <div className="px-6">
                    {signType === SignTypeEn.Account && <PageTitle title={`Get Account`} />}
                    {signType === SignTypeEn.Transaction && <PageTitle title={`Signature Request`} />}
                    {signType === SignTypeEn.Message && <PageTitle title={`Sign Message`} />}
                </div>
                <div className="info-box">
                    <div className="mb-2 text-gray60">Account</div>
                    <div className="flex gap-2 items-center">
                        <AddressIcon width={32} address={walletAddress} />
                        <div className="font-bold text-lg font-sans">
                            {walletAddress.slice(0, 6)}...
                            {walletAddress.slice(-6)}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4">
                    <div className="mb-2 text-gray60">Origin</div>
                    <div className="font-bold text-lg">{origin}</div>
                </div>
                <div className="info-box">
                    <div className="mb-2 text-gray60">
                        {signType === SignTypeEn.Account && "Account"}
                        {signType === SignTypeEn.Transaction && "Transaction"}
                        {signType === SignTypeEn.Message && "Message"}
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                        {signType === SignTypeEn.Account && "Get Accounts"}
                        {signType === SignTypeEn.Transaction && (
                            <div className="capitalize">Decoded: {decodedData ? decodedData.functionName : ""}</div>
                        )}
                        {signType === SignTypeEn.Message && messageToSign}
                    </div>
                </div>
                {signType === SignTypeEn.Transaction && (
                    <>
                        <div className="px-6 py-4">
                            <TokenSelect label="Gas" selectedAddress={payToken} onChange={setPayToken} />
                            <div className="h-2" />
                            <CostItem label="Total cost" loading={loadingFee} memo={`Max: ${feeCost}`} />
                        </div>
                    </>
                )}
            </div>

            <div className="flex gap-2 px-6">
                <Button type="reject" className="!w-1/2" onClick={onReject}>
                    Reject
                </Button>
                {signType === SignTypeEn.Account && (
                    <Button
                        type="primary"
                        className="!w-1/2"
                        onClick={onConfirm}
                        loading={signing}
                        disabled={loadingFee}
                    >
                        Confirm
                    </Button>
                )}
                {signType === SignTypeEn.Transaction && (
                    <Button
                        type="primary"
                        className="!w-1/2"
                        onClick={onConfirm}
                        loading={signing}
                        disabled={loadingFee}
                    >
                        Sign
                    </Button>
                )}
                {signType === SignTypeEn.Message && (
                    <Button type="primary" className="!w-1/2" onClick={onSign}>
                        Sign
                    </Button>
                )}
            </div>
        </div>
    );
};

export default forwardRef(SignTransaction);
