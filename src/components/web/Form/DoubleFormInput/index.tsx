import React, { ChangeEvent, useState } from "react";
import { Box, Text, Input } from "@chakra-ui/react"

interface IProps {
  leftValue?: string;
  leftPlaceholder?: string;
  leftErrorMsg?: string;
  leftOnChange: (value: string) => void;
  leftOnBlur?: (value: string) => void;
  rightValue?: string;
  rightPlaceholder?: string;
  rightErrorMsg?: string;
  rightOnChange: (value: string) => void;
  rightOnBlur?: (value: string) => void;
  _styles?: any;
  _leftInputStyles?: any;
  _rightInputStyles?: any;
  leftLabel?: String;
  rightLabel?: String;
  leftAutoFocus?: any;
  onEnter?: any;
}

export default function DoubleFormInput({
  leftLabel,
  leftValue,
  leftPlaceholder,
  leftErrorMsg,
  leftOnChange,
  leftOnBlur,
  rightLabel,
  rightValue,
  rightPlaceholder,
  rightErrorMsg,
  rightOnChange,
  rightOnBlur,
  _styles,
  _leftInputStyles,
  _rightInputStyles,
  leftAutoFocus,
  onEnter
}: IProps) {
  const handleLeftChange = (e: ChangeEvent<HTMLInputElement>) => {
    leftOnChange(e.target.value);
  };

  const handleRightChange = (e: ChangeEvent<HTMLInputElement>) => {
    rightOnChange(e.target.value);
  };

  const handleLeftBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (leftOnBlur) leftOnBlur(e.target.value);
  };

  const handleRightBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (rightOnBlur) rightOnBlur(e.target.value);
  };

  const onKeyDown = (event: any) => {
    if (event.keyCode === 13 && onEnter) {
      onEnter();
    }
  }

  return (
    <Box display="flex" flexDirection="row" {..._styles}>
      <Box display="flex" flexDirection="column" width="30%">
        {leftLabel && (<Box as="label" htmlFor="leftLabel">{leftLabel}</Box>)}
        <Box position="relative">
          <Box>
            <Input
              type="text"
              placeholder={leftPlaceholder}
              value={leftValue ?? ""}
              onChange={handleLeftChange}
              onBlur={handleLeftBlur}
              borderRadius="1em"
              paddingLeft="1.5rem"
              paddingRight="1.5rem"
              height="3em"
              background="white"
              borderTopRightRadius="0"
              borderBottomRightRadius="0"
              borderRightColor="transparent"
              autoFocus={leftAutoFocus}
              onKeyDown={onKeyDown}
              {..._leftInputStyles}
            />
          </Box>
        </Box>
        <Text color="#FF4343" padding="0 10px" fontSize="14px">{leftErrorMsg}</Text>
      </Box>
      <Box display="flex" flexDirection="column" width="70%">
        {rightLabel && (<Box as="label" htmlFor="rightLabel">{rightLabel}</Box>)}
        <Box position="relative">
          <Box>
            <Input
              type="text"
              placeholder={rightPlaceholder}
              value={rightValue ?? ""}
              onChange={handleRightChange}
              onBlur={handleRightBlur}
              borderRadius="1em"
              paddingLeft="1.5rem"
              paddingRight="1.5rem"
              height="3em"
              background="white"
              borderTopLeftRadius="0"
              borderBottomLeftRadius="0"
              onKeyDown={onKeyDown}
              {..._rightInputStyles}
            />
          </Box>
        </Box>
        <Text color="#FF4343" padding="0 10px" fontSize="14px">{rightErrorMsg}</Text>
      </Box>
    </Box>
  );
}
