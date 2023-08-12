import React, { useEffect } from "react";
import { Navbar } from "@src/components/Navbar";
import useWalletContext from "@src/context/hooks/useWalletContext";
import AccountCard from "@src/components/AccountCard";
import { Box } from "@chakra-ui/react";
import Operations from "./comp/Operations";
import ActivateHint from "./comp/ActivateHint";
import Footer from "@src/components/Footer";
import Actions from "./comp/Actions";
import useConfig from "@src/hooks/useConfig";

export function Wallet() {
    const { selectedAddressItem } = useConfig();
  
    return (
        <>
            <Box p="5">
                <Navbar />
                <AccountCard />
                {!selectedAddressItem.activated ? <ActivateHint /> : <Actions />}
                <Operations />
            </Box>
            <Footer />
        </>
    );
}
