import PasswordSetting from "@src/pages/v1/Create/Steps/PasswordSetting";
import { CreateStepEn, StepContextProvider, useStepContext } from "@src/context/StepContext";
import React, { ReactNode, useMemo } from "react";
import {EnHandleMode} from '@src/lib/type'
import FullscreenContainer from "@src/components/FullscreenContainer";
import GuardiansSetting from "./Steps/GuardiansSetting";
import GuardiansSaving from "./Steps/GuardiansSaving";
import DefaultSetting from "./Steps/DefaultSetting";
import ProgressNavBar from "@src/components/ProgressNavBar";
import StepCompletion from "@src/components/StepCompletion";
import GuardianHint from "@src/components/GuardianHint";

type StepNodeInfo = {
  title: string;
  element: ReactNode;
  hint?: ReactNode;
};

const StepComponent = () => {
  const stepNodeMap: Record<number, StepNodeInfo> = useMemo(() => {
    return {
      [CreateStepEn.CreatePWD]: {
        title: "Get Started",
        element: <PasswordSetting />,
      },
      [CreateStepEn.SetupGuardians]: {
        title: "Set up Guardians",
        element: <GuardiansSetting />,
        hint: <GuardianHint />,
      },
      [CreateStepEn.SaveGuardianList]: {
        title: "Save Guardian List",
        element: <GuardiansSaving />,
      },
      [CreateStepEn.SetSoulWalletAsDefault]: {
        title: "Set as default plugin wallet",
        element: <DefaultSetting />,
      },
      [CreateStepEn.Completed]: {
        title: "Congratulation, your Soul Wallet is created!",
        element: <StepCompletion mode={EnHandleMode.Create} />,
      },
    };
  }, []);

  const {
    step: { current },
  } = useStepContext();

  return (
    <div>
      {/* <ProgressNavBar
          title={stepNodeMap[current].title}
          maxStep={CreateStepEn.Completed}
          hint={stepNodeMap[current]?.hint}
          /> */}
      {stepNodeMap[current].element}
    </div>
  );
};

export default function CreatePage() {
  return (
    <FullscreenContainer>
      <StepContextProvider>
        <StepComponent />
      </StepContextProvider>
    </FullscreenContainer>
  );
}