import React, { useState, useEffect } from "react";
import api from "@src/lib/api";
import { Link } from "react-router-dom";
import { getLocalStorage, setLocalStorage } from "@src/lib/tools";
import Logo from "@src/components/Logo";
import { SendEmail } from "@src/components/SendEmail";
import { CreatePassword } from "@src/components/CreatePassword";

export function CreateWallet() {
    const [step, setStep] = useState<number>(0);
    const [cachedEmail, setCachedEmail] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    const onReceiveCode = async (email: string, code: string) => {
        setEmail(email);
        // todo, extract ts
        const res: any = await api.account.add({
            email,
            code,
        });
        if (res.code === 200) {
            await setLocalStorage("authorization", res.data.jwtToken);
            setStep(1);
        }
    };

    const onCreated: any = async (address: string) => {
        const res = await api.account.update({
            email,
            wallet_address: address,
        });
        if (res) {
            setStep(2);
            // todo, this is for guardian
            await setLocalStorage('email', email)
        }
    };

    const getCachedProcess = async () => {
        const storageCachedEmail = await getLocalStorage("cachedEmail");
        if (storageCachedEmail) {
            setCachedEmail(storageCachedEmail);
        }
    };

    useEffect(() => {
        getCachedProcess();
    }, []);

    return (
        <>
            <div className="p-6 h-full flex flex-col">
                <Logo />
                <div>
                    {step === 0 && (
                        <>
                            <div className="page-title mb-4">
                                Email verification
                            </div>
                            <SendEmail
                                onReceiveCode={onReceiveCode}
                                cachedEmail={cachedEmail}
                            />
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <div className="page-title mb-4">
                                Create password
                            </div>
                            <CreatePassword onCreated={onCreated} />
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="page-title mb-8">
                                Congratulations
                            </div>
                            <div className="page-desc mb-10">
                                <div className="mb-2">
                                    You have created your first wallet!
                                </div>
                                <div className="mb-2">
                                    Now you can use this wallet to receive fund.
                                </div>
                                <div className="mb-2">
                                    To unlock full feature, please deploy this
                                    wallet after you received/top up your
                                    wallet.
                                </div>
                            </div>
                            <Link to="/wallet">
                                <a className="btn btn-blue w-full">Continue</a>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
