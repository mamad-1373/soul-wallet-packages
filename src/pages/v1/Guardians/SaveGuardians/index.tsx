import { SButton } from "@src/components/Button";
import { CreateStepEn, StepActionTypeEn, useStepDispatchContext } from "@src/context/StepContext";
import React, { useState } from "react";
import GuardiansSaver from "@src/components/GuardiansSaver";
import Button from "@src/components/web/Button";
import { Box, Text, Image } from "@chakra-ui/react"
import Heading1 from "@src/components/web/Heading1";
import Heading2 from "@src/components/web/Heading2";
import Heading3 from "@src/components/web/Heading3";
import TextBody from "@src/components/web/TextBody";

const GuardiansSaving = () => {
  const [hasSaved, setHasSaved] = useState(false);
  const [skipped] = useState(false);

  const dispatch = useStepDispatchContext();

  const handleSaved = () => {
    setHasSaved(true);
  };

  const handleNext = () => {
    dispatch({
      type: StepActionTypeEn.JumpToTargetStep,
      payload: CreateStepEn.SetSoulWalletAsDefault,
    });
  };

  if (skipped) {
    return (
      <div className="max-w-lg">
        <div className="flex flex-col items-center justify-center bg-[white] px-10 py-4 rounded-xl">
          <div className="skip-warning-section">
            <div className="skip-warning-title">What if I don’t set up guardian now?</div>
            <div className="skip-warning-text">Guardians are required to recover your wallet in the case of loss or theft. You can learn more here</div>
          </div>
          <div className="skip-warning-section">
            <div className="skip-warning-title">Can I set guardians in the future?</div>
            <div className="skip-warning-text">Yes. You can setup or change your guardians anytime on your home page.</div>
          </div>
          <SButton className="w-full" type="primary" onClick={() => handleNext()}>
            Set guardians now
          </SButton>
          <a className="skip-text mx-auto self-center my-5" onClick={() => handleNext()}>
            I understand the risks, skip for now
          </a>
        </div>
      </div>
    )
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">

      <Heading1>Guardians saved!</Heading1>
      <Box marginBottom="0.75em">
        <TextBody textAlign="center" maxWidth="500px">
          Your guardian list change request has been received and will be pending for 24 hours before being activated. You may cancel this change within the next 24 hours
        </TextBody>
        <TextBody textAlign="center" maxWidth="500px">
          Make sure to save your list of guardians for social recovery. Choose at least one method below to keep this list safe.
        </TextBody>
      </Box>
      <GuardiansSaver onSave={handleSaved} />
      <Button disabled={!hasSaved} onClick={handleNext} _styles={{ width: '400px', marginTop: '0.75em' }} loading={true}>
        Continue
      </Button>
    </Box>
  )
};

export default GuardiansSaving;