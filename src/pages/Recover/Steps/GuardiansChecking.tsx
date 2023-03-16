import Button from "@src/components/Button";
import GuardianForm, { IGuardianFormHandler } from "@src/components/GuardianForm";
import { RecoverStepEn, StepActionTypeEn, useStepDispatchContext } from "@src/context/StepContext";
import React, { useRef, useState } from "react";
import attentionIcon from "@src/assets/icons/attention.svg";
import ModalV2 from "@src/components/ModalV2";
import useWallet from "@src/hooks/useWallet";
import { useRecoveryContext } from "@src/context/RecoveryContext";
import { GuardianItem } from "@src/lib/type";
import { notify } from "@src/lib/tools";

interface IGuardianChecking {
    walletAddress: string;
    payToken: string;
}

const GuardiansChecking = ({ walletAddress, payToken }: IGuardianChecking) => {
    const [loading, setLoading] = useState(false);
    const { initRecoverWallet } = useWallet();

    const formRef = useRef<IGuardianFormHandler>(null);
    const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

    const { cachedGuardians } = useRecoveryContext();
    const dispatch = useStepDispatchContext();
    const handleCheckGuardianAddresses = () => {
        // TODO: here
        // // 👇 mock logic, delete it
        // setShowVerificationModal(true);
        // setTimeout(() => {
        //     setShowVerificationModal(false);
        // }, 3000);
        // ! if check pass, then submit guardians to the global store
        // formRef.current?.submit();
        // TODO: once the guardians are submitted, clear the temporary guardians
    };

    const handleAskSignature = async () => {
        handleCheckGuardianAddresses();
        try {
            setLoading(true)
            const guardians = (await formRef.current?.submit()) as GuardianItem[];
            await initRecoverWallet(walletAddress, guardians, payToken);
            dispatch({
                type: StepActionTypeEn.JumpToTargetStep,
                payload: RecoverStepEn.SignaturePending,
            });
        } catch (error) {
            notify("Error", "Failed to init recover request")
            console.error(error);
        }finally{
            setLoading(false)
        }
    };
    return (
        <div className="pt-6 flex flex-col">
            {/* TODO: pass init data from file parsing? */}
            <GuardianForm ref={formRef} guardians={cachedGuardians} />

            <Button type="primary" loading={loading} className="w-base mx-auto my-6" onClick={handleAskSignature}>
                Ask For Signature
            </Button>

            <ModalV2 visible={showVerificationModal} id="verification-failed">
                <div className="flex flex-col items-center w-[480px] ">
                    <h1>Guardian addresses Verification failed</h1>
                    <img src={attentionIcon} alt="" className="w-16 h-16 my-10" />
                    <Button type="primary" onClick={handleCheckGuardianAddresses}>
                        Check again
                    </Button>
                </div>
            </ModalV2>
        </div>
    );
};

export default GuardiansChecking;
