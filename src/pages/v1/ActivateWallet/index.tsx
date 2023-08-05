import React, { useEffect, useState } from "react";
import useWalletContext from "@src/context/hooks/useWalletContext";
import { Navbar } from "@src/components/Navbar";
import CostItem from "@src/components/CostItem";
import { toast } from "material-react-toastify";
import config from "@src/config";
import useWallet from "@src/hooks/useWallet";
import { Box, Text, Flex, Divider } from "@chakra-ui/react";
import { useBalanceStore } from "@src/store/balanceStore";
import { InfoWrap, InfoItem } from "@src/components/SignTransaction";
import useQuery from "@src/hooks/useQuery";
import GasSelect from "@src/components/SendAssets/comp/GasSelect";
import useBrowser from "@src/hooks/useBrowser";
import PageTitle from "@src/components/PageTitle";
import BN from "bignumber.js";
import ReceiveCode from "@src/components/ReceiveCode";
import Button from "@src/components/Button";
import { useAddressStore } from "@src/store/address";
// import ApprovePaymaster from "@src/components/ApprovePaymaster";

export default function ActivateWallet() {
    const { getWalletType, account } = useWalletContext();
    const { selectedAddress } = useAddressStore();
    const [maxCost, setMaxCost] = useState("");
    const [payToken, setPayToken] = useState(config.zeroAddress);
    const [paymasterApproved, setPaymasterApproved] = useState(true);
    const [payTokenSymbol, setPayTokenSymbol] = useState("");
    const { getTokenByAddress, getBalances } = useQuery();
    const [loading, setLoading] = useState(false);
    const { activateWallet } = useWallet();
    const { navigate } = useBrowser();
    const { tokenBalance, fetchTokenBalance } = useBalanceStore();

    const doActivate = async () => {
        // if (new BN(userBalance).isLessThan(maxCost)) {
        //     toast.error("Balance not enough");
        //     return;
        // }
        setLoading(true);
        try {
            await activateWallet(payToken, paymasterApproved, false);
            navigate("wallet");
            toast.success("Account activated");
        } catch (err) {
            toast.error(String(err));
            console.log("activate error", err);
        } finally {
            setLoading(false);
        }
    };

    const onPayTokenChange = async () => {
        // important TODO, clear previous request
        setMaxCost("");
        const token = getTokenByAddress(payToken);
        setPayTokenSymbol(token.symbol);
        const { requireAmount, requireAmountInWei }: any = await activateWallet(payToken, paymasterApproved, true);
        setMaxCost(requireAmount);
    };

    const checkBalance = async () => {
        getBalances();
    };

    useEffect(() => {
        if (!account || !payToken || !selectedAddress) {
            return;
        }
        onPayTokenChange();
    }, [payToken, account, selectedAddress]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            checkBalance();
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!selectedAddress) {
            return;
        }
        getWalletType();
    }, [selectedAddress]);

    useEffect(() => {
        if (!paymasterApproved) {
            setPayToken(config.zeroAddress);
        }
    }, [paymasterApproved]);

    const balanceEnough = true;

    return (
        <Box px="5" pt="6">
            <Navbar backUrl="wallet" />
            <PageTitle mb="0">Activate your Soul Wallet</PageTitle>
            <Text fontWeight={"600"} my="12px">
                Setting up your wallet requires a fee to cover deployment gas costs. This is not a Soul Wallet service
                charge.
                <br />
                <br />
                Add any of the following tokens to your wallet, and then you can continue the activation process: ETH,
                USDC, DAI, USDT.
            </Text>
            <Box bg="#fff" rounded="20px" p="3">
                <ReceiveCode walletAddress={selectedAddress} />
                <Divider h="1px" bg="#d7d7d7" my="2" />
                <InfoWrap gap="3">
                    <InfoItem>
                        <Text>Network</Text>
                        <Text>Ethereum</Text>
                    </InfoItem>
                    <InfoItem>
                        <Text>Network fee</Text>
                        {maxCost ? (
                            <Flex gap="2">
                                <Text>{maxCost}</Text>
                                <GasSelect gasToken={payToken} onChange={setPayToken} />
                            </Flex>
                        ) : (
                            "Loading..."
                        )}
                    </InfoItem>
                </InfoWrap>
            </Box>

            <Button
                disabled={!maxCost || !balanceEnough}
                w="full"
                loading={loading}
                onClick={doActivate}
                fontSize="20px"
                py="4"
                fontWeight={"800"}
                mt="14px"
            >
                Activate
            </Button>

            {!balanceEnough && (
                <Text
                    color="#FF2096"
                    textAlign={"center"}
                    fontSize={"12px"}
                    fontWeight={"500"}
                    fontFamily={"Martian"}
                    mt="1"
                >
                    Not enough {payTokenSymbol} for activation
                </Text>
            )}

            {/* {step === 1 && (
                        <>
                            <Button type="reject" className="flex-1 w-full" onClick={() => navigate("wallet")}>
                                Reject
                            </Button>
                            <Button type="primary" className="flex-1 w-full" onClick={doActivate} loading={loading}>
                                Confirm
                            </Button>
                        </>
                    )} */}

            {/* <div className="px-6">
                            <ApprovePaymaster value={paymasterApproved} onChange={setPaymasterApproved} />
                        </div> */}
        </Box>
    );
}
