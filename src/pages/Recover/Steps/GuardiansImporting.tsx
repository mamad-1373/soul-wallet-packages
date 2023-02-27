import Button from "@src/components/Button";
import FileUploader from "@src/components/FileUploader";
import { RecoverStepEn, StepActionTypeEn, useStepDispatchContext } from "@src/context/StepContext";
import useTools from "@src/hooks/useTools";
import React, { useState } from "react";
import { RecoveryActionTypeEn, useRecoveryDispatchContext } from "@src/context/RecoveryContext";
import { nanoid } from "nanoid";
import { toast } from "material-react-toastify";

const GuardiansImporting = () => {
    const [fileValid, setFileValid] = useState(false);
    const { getJsonFromFile } = useTools();

    const stepDispatch = useStepDispatchContext();
    const recoveryDispatch = useRecoveryDispatchContext();

    const handleNext = () => {
        stepDispatch({
            type: StepActionTypeEn.JumpToTargetStep,
            payload: RecoverStepEn.GuardiansChecking,
        });
    };

    const handleFileParseResult = async (file?: File) => {
        if (!file) {
            return;
        }
        const fileJson: any = await getJsonFromFile(file);

        const fileGuardians = fileJson.guardians;
        // ! just simple validation for now. please DO check this
        if (Array.isArray(fileGuardians)) {
            const parsedGuardians = [];

            for (let i = 0; i < fileGuardians.length; i++) {
                const { address, name } = fileGuardians[i];

                if (!address || !name) {
                    toast.error("Oops, something went wrong. Please check your file and try again.");
                    return;
                }

                parsedGuardians.push({
                    address,
                    name,
                    id: nanoid(),
                });
            }

            recoveryDispatch({
                type: RecoveryActionTypeEn.UpdateCachedGuardians,
                payload: JSON.parse(JSON.stringify(parsedGuardians)),
            });

            setFileValid(true);
        }
    };

    return (
        <div className="flex flex-col items-center pt-6">
            <FileUploader onFileChange={handleFileParseResult} />

            <Button type="primary" className="w-base mx-auto mt-6" disabled={!fileValid} onClick={handleNext}>
                Check guardians parsing results
            </Button>

            <a className="skip-text mx-auto self-center mt-4 mb-6" onClick={handleNext}>
                Input guardians manually
            </a>
        </div>
    );
};

export default GuardiansImporting;
