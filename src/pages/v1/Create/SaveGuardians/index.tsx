import React, { useEffect, useState } from "react";
import { SButton } from "@src/components/Button";
import { CreateStepEn, StepActionTypeEn, useStepDispatchContext } from "@src/context/StepContext";
import { getLocalStorage, validateEmail } from "@src/lib/tools";
import { useGlobalStore } from "@src/store/global";
import { Box, Text, Image } from "@chakra-ui/react"
import useTools from "@src/hooks/useTools";
import FormInput from "@src/components/web/Form/FormInput";
import Heading1 from "@src/components/web/Heading1";
import Heading2 from "@src/components/web/Heading2";
import Heading3 from "@src/components/web/Heading3";
import TextBody from "@src/components/web/TextBody";
import Button from "@src/components/web/Button";
import TextButton from "@src/components/web/TextButton";
import WarningIcon from "@src/components/Icons/Warning";
import DownloadIcon from '@src/components/Icons/Download'
import SendIcon from '@src/components/Icons/Send'
import useForm from "@src/hooks/useForm";

const validate = (values: any) => {
  const errors: any = {}
  const { email } = values

  if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  return errors
}

const SaveGuardians = () => {
  const [hasSaved, setHasSaved] = useState(false);
  const { downloadJsonFile, emailJsonFile, formatGuardianFile } = useTools();
  const { guardians } = useGlobalStore();
  const [email, setEmail] = useState<string>();
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const emailForm = useForm({
    fields: ['email'],
    validate
  })

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const handleDownload = async () => {
    setDownloading(true);

    const walletAddress = await getLocalStorage("walletAddress");

    const jsonToSave = formatGuardianFile(walletAddress, guardians);

    downloadJsonFile(jsonToSave);

    setDownloading(false);

    // onSave();
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
  };

  const handleSendEmail = async () => {
    if (!email) {
      return;
    }
    setSending(true);

    try {
      const walletAddress = await getLocalStorage("walletAddress");

      const jsonToSave = formatGuardianFile(walletAddress, guardians);

      const res: any = await emailJsonFile(jsonToSave, email);

      if (res.code === 200) {
        // onSave();
      }
    } catch {
      // maybe toast error message?
    } finally {
      setSending(false);
    }
  };

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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">

      <Heading1>Backup Guardians</Heading1>
      <Box marginBottom="0.75em">
        <TextBody fontSize="0.875em" textAlign="center" maxWidth="500px">
          Make sure to save your list of guardians for social recovery. Choose at least one method below to keep this list safe.
        </TextBody>
      </Box>
      <Box display="flex">
        <Box width="400px" borderRight="1px solid #D7D7D7" padding="20px" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start">
          <Heading3>Set Guardians</Heading3>
          <Box marginBottom="0.75em">
            <TextBody textAlign="center">
              If you choose to store your own guardian list, make you save the file and remember it's location as it will be needed for future wallet recovery.
            </TextBody>
          </Box>
          <FormInput
            label=""
            placeholder="Send to Email"
            value={emailForm.values.email}
            errorMsg={emailForm.showErrors.email && emailForm.errors.email}
            onChange={emailForm.onChange('email')}
            onBlur={emailForm.onBlur('email')}
            _styles={{ width: '100%', marginTop: '0.75em' }}
            RightIcon={<SendIcon />}
          // onClick={handleSendEmail}
          />
          <Button onClick={handleDownload} loading={downloading} _styles={{ width: '100%', marginTop: '0.75em' }} LeftIcon={<DownloadIcon />}>
            Download
          </Button>
        </Box>
        <Box width="400px" padding="20px" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start">
          <Heading3>Save with Soul Wallet</Heading3>
          <Box marginBottom="0.75em">
            <TextBody textAlign="center">
              Soul Wallet can store your list encrypted on-chain, but you still need to remember your wallet address for recovery.
            </TextBody>
          </Box>
          <Button loading={downloading} _styles={{ width: '100%' }}>
            Store On-chain
          </Button>
        </Box>
      </Box>
      <Button disabled={false} onClick={handleNext} _styles={{ width: '400px', marginTop: '0.75em' }}>
        Continue
      </Button>
    </Box>
  )
};

export default SaveGuardians;
