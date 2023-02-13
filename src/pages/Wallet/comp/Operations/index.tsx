import React, { useState } from "react";
import cn from "classnames";
import Assets from "./comp/Assets";
import Activitys from "./comp/Activitys";
const tabs = ["assets", "activity", "Dapps"];

export default function Operations() {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    return (
        <>
            <div className="py-3 relative flex-1">
                <div className="flex px-6">
                    {tabs.map((item, index) => (
                        <a
                            key={index}
                            className={cn(
                                "py-3 text-center flex-1 cursor-pointer capitalize border-b border-color text-[#737373] text-sm leading-none",
                                activeTabIndex === index &&
                                    "border-blue text-blue text-base font-bold",
                            )}
                            onClick={() => setActiveTabIndex(index)}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="h-[150px] overflow-y-scroll">
                    {activeTabIndex === 0 && <Assets />}
                    {activeTabIndex === 1 && <Activitys />}
                </div>
            </div>
        </>
    );
}
