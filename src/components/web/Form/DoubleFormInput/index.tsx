import React, { ChangeEvent, useState } from "react";
import classNames from "classnames";
import { Box, Text, Image, Input } from "@chakra-ui/react"

interface IProps {
  leftValue?: string;
  leftPlaceholder?: string;
  leftErrorMsg?: string;
  leftOnChange: (value: string) => void;
  rightValue?: string;
  rightPlaceholder?: string;
  rightErrorMsg?: string;
  rightOnChange: (value: string) => void;
  _styles?: any;
  leftLabel?: String;
  rightLabel?: String;
}

export default function DoubleFormInput({
  leftLabel,
  leftValue,
  leftPlaceholder,
  leftErrorMsg,
  leftOnChange,
  rightLabel,
  rightValue,
  rightPlaceholder,
  rightErrorMsg,
  rightOnChange,
  _styles
}: IProps) {
  const handleLeftChange = (e: ChangeEvent<HTMLInputElement>) => {
    leftOnChange(e.target.value);
  };

  const handleRightChange = (e: ChangeEvent<HTMLInputElement>) => {
    rightOnChange(e.target.value);
  };

  return (
    <Box display="flex" flexDirection="row" {..._styles}>
      <Box display="flex" flexDirection="column" width="50%">
        {leftLabel && (<Box as="label" htmlFor="leftLabel">{leftLabel}</Box>)}
        <Box position="relative">
          <Box>
            <Input
              type="text"
              placeholder={leftPlaceholder}
              value={leftValue ?? ""}
              onChange={handleLeftChange}
              borderRadius="1em"
              paddingLeft="1.5rem"
              paddingRight="1.5rem"
              height="3em"
              background="white"
              borderTopRightRadius="0"
              borderBottomRightRadius="0"
              borderRightColor="transparent"
            />
          </Box>
        </Box>
        <Text color="#FF4343" padding="0 10px" fontSize="14px">{leftErrorMsg}</Text>
      </Box>
      <Box display="flex" flexDirection="column" width="50%">
        {rightLabel && (<Box as="label" htmlFor="rightLabel">{rightLabel}</Box>)}
        <Box position="relative">
          <Box>
            <Input
              type="text"
              placeholder={rightPlaceholder}
              value={rightValue ?? ""}
              onChange={handleRightChange}
              borderRadius="1em"
              paddingLeft="1.5rem"
              paddingRight="1.5rem"
              height="3em"
              background="white"
              borderTopLeftRadius="0"
              borderBottomLeftRadius="0"
            />
          </Box>
        </Box>
        <Text color="#FF4343" padding="0 10px" fontSize="14px">{rightErrorMsg}</Text>
      </Box>
    </Box>
  );
}