import React from "react";
import { Box, Text } from "@chakra-ui/react";
import Button from "@src/components/Button";
import useBrowser from "@src/hooks/useBrowser";
import useSoulWallet from "@src/hooks/useSoulWallet";
import useWalletContext from "@src/context/hooks/useWalletContext";

export default function ActivateHint() {
    const { navigate } = useBrowser();
    const {account} = useWalletContext();
    const {calcWalletAddress} = useSoulWallet();
    return (
        <Box bg="#fff" rounded="20px" p="4" pb="3" color="#000" mt="4" mb="6">
            <Text fontWeight={"800"} fontSize={"18px"} mb="1">
                Activate wallet now!
            </Text>
            <Text fontSize="14px" fontWeight={"600"}>
                Welcome to a world of possibilities! Add ETH, USDC, DAI, or USDT to continue the setup of your wallet.
            </Text>
            <Box textAlign={"right"}>
                <Button fontSize="14px" fontWeight={"800"} py="2" onClick={() => navigate("activate-wallet")}>
                    Begin
                </Button>
                <Button fontSize="14px" fontWeight={"800"} py="2" onClick={async() => console.log('calc', await calcWalletAddress(0, account, [], 0))}>
                    Calculate Addr
                </Button>
            </Box>
        </Box>
    );
}
