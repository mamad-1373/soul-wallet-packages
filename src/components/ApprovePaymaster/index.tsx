import React from "react";
import Switch from "../Switch";

export default function ApprovePaymaster({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-center justify-between w-full">
            <div>
                <div>Approve Paymaster</div>
                <div className="text-sm text-gray60 mt-1">Use USD to pay for gas</div>
            </div>
            <Switch checked={value} onChange={onChange} />
        </div>
    );
}
