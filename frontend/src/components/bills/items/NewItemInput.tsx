// import Input from '../../ui/Input'
import {useState} from 'react';
import {Input} from "@nextui-org/react";
import {Button} from '@mui/material';

// import { Button } from "@nextui-org/react";

interface BillItemInputProps {
    // onChange: (field: string, value: string | number) => void;
    onSave: (name: string, price: string | number, quantity: string | number) => void;
    onCancel: () => void;
}

export default function BillItemInput({onSave, onCancel}: BillItemInputProps): React.JSX.Element {
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string | number>(0);
    const [quantity, setQuantity] = useState<string | number>(0);
    const handleSaveClick = () => {
        onSave(name, price, quantity);
    }

    return (
        <div className={"border"}>
            <div className={"grid grid-cols-1 md:grid-cols-3 md:gap-3  rounded-lg p-3 gap-3"}>
                <Input
                    aria-label={"new-item-name"}
                    clearable
                    placeholder={"Name"}
                    onChange={(e: any) => setName(e.target.value)}
                />
                <div className={"flex gap-3 justify-between"}>
                    <Input
                        aria-label={"new-item-price"}
                        type={"number"}
                        placeholder={"Price"}
                        labelLeft={"$"}
                        onChange={(e: any) => setPrice(parseFloat(e.target.value))}
                    />
                    <Input
                        aria-label={"new-item-quantity"}
                        type={"number"}
                        placeholder={"Quantity"}
                        width={"100px"}
                        onChange={(e: any) => setQuantity(parseInt(e.target.value))}
                    />
                </div>
                <Input
                    aria-label={"new-item-person"}
                    placeholder={"Person (coming soon)"}
                    disabled
                />
            </div>
            <div className={"text-center"}>
                <Button
                    color={"success"}
                    onClick={handleSaveClick}
                >
                    Save
                </Button>
                <Button
                    color={"warning"}
                    onClick={onCancel}
                        >
                    Cancel
                </Button>
            </div>
        </div>
    )
}