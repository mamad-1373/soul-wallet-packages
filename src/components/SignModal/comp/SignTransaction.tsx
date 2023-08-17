import React from "react";
import { Flex, Box, Text, Image } from "@chakra-ui/react";
import GasSelect from "../../SendAssets/comp/GasSelect";
import AddressInput from "../../SendAssets/comp/AddressInput";
import { useAddressStore } from "@src/store/address";
import Button from "../../Button";
import { InfoWrap, InfoItem } from "../index";

export default function SignTransaction({
    decodedData,
    sendToAddress,
    sponsor,
    feeCost,
    payToken,
    setPayToken,
    payTokenSymbol,
    loadingFee,
    signing,
    onConfirm,
    origin,
}: any) {
    const { selectedAddress } = useAddressStore();

    return (
        <>
            <Text fontSize="20px" fontWeight="800" color="#1e1e1e">
                Sign Transaction
            </Text>

            {origin && (
                <Text fontWeight={"600"} mt="1">
                    {origin}
                </Text>
            )}

            <Flex flexDir={"column"} gap="5" mt="6">
                <Box bg="#fff" py="3" px="4" rounded="20px" fontWeight={"800"}>
                    <div>
                        {decodedData && decodedData.length > 0
                            ? decodedData.map((item: any, index: number) => (
                                  <span className="mr-1 capitalize" key={index}>
                                      {decodedData.length > 1 && `${index + 1}.`}
                                      {item.functionName || "Contract interaction"}
                                  </span>
                              ))
                            : "Contract interaction"}
                    </div>
                </Box>
                <AddressInput label="From" address={selectedAddress} disabled />
                {sendToAddress ? (
                    <AddressInput label="To" address={sendToAddress} disabled={true} />
                ) : (
                    <AddressInput label="To" address={decodedData[0] && decodedData[0].to} disabled={true} />
                )}

                <>
                    <InfoWrap>
                        <InfoItem align={sponsor && "flex-start"}>
                            <Text>Gas fee</Text>
                            {sponsor ? (
                                <Box textAlign={"right"}>
                                    <Flex mb="1" gap="4" justify={"flex-end"}>
                                        {feeCost && (
                                            <Text textDecoration={"line-through"}>
                                                {feeCost.split(" ")[0]} {payTokenSymbol}
                                            </Text>
                                        )}
                                        <Text>0 ETH</Text>
                                    </Flex>
                                    <Text color="#898989">Sponsored by {sponsor.sponsorParty || "Soul Wallet"}</Text>
                                </Box>
                            ) : feeCost ? (
                                <Flex gap="2">
                                    <Text>{feeCost.split(" ")[0]}</Text>
                                    <GasSelect gasToken={payToken} onChange={setPayToken} />
                                </Flex>
                            ) : (
                                <Text>Loading...</Text>
                            )}
                        </InfoItem>
                        <InfoItem>
                            <Text>Total</Text>
                            <Text>$1736.78</Text>
                        </InfoItem>
                    </InfoWrap>
                </>
            </Flex>
            <Button
                w="100%"
                fontSize={"20px"}
                py="4"
                fontWeight={"800"}
                mt="6"
                onClick={onConfirm}
                loading={signing}
                disabled={loadingFee && !sponsor}
            >
                Sign
            </Button>
        </>
    );
}
