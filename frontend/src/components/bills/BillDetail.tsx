import {Modal} from '@nextui-org/react';
import {Button, Typography, Stack} from '@mui/material';
import {Bill, Item, Fee} from "../../assets/interfaces";
import {useEffect, useState} from "react";
import {getItemsByBillId, createItem, NewItemRequest, deleteItem, updateItem} from "../../api/billService.js";
import {createFee, deleteFee, getFeesByBillId, NewFeeRequest, updateFee} from "../../api/feeService.tsx";
import BillItemInput from './items/NewItemInput.tsx';
import ItemRow from './items/ItemRow.tsx';
import FeesList from "./fees/FeesList.tsx";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import NewFeeInput from "./fees/NewFeeInput.tsx";

interface Props {
    bill: Bill;
    setVisible: (visible: boolean) => void;
    bindings: any;
    isMobile: boolean;
    updateBillTotal: (billId: number, newTotal: number) => void;
}

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, function (txt: string) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export default function BillDetail({bill, bindings, isMobile, updateBillTotal}: Props) {
    const [billTotal, setBillTotal] = useState(bill.total);
    const [items, setItems] = useState(bill.items || []);
    const [fees, setFees] = useState(bill.fees || []);
    const [showItemInput, setShowItemInput] = useState<boolean>(false);
    const [showFeeInput, setShowFeeInput] = useState<boolean>(false);

    const handleCancelItemInput = () => {
        setShowItemInput(false);
    }

    const handleCancelFeeInput = () => {
        setShowFeeInput(false);
    }

    useEffect(() => {
        getItemsByBillId(bill.id)
            .then(response => {
                setItems(response.data);
            })
            .catch(error => {
                console.error('Error fetching items: ', error);
            })
        getFeesByBillId(bill.id)
            .then(response => {
                setFees(response.data);
            })
            .catch(error => {
                console.error('Error fetching fees: ', error);
            })
    }, [bill.id]);

    const handleAddNewItem = (name: string, price: any, quantity: any) => {
        createItem(
            new NewItemRequest(name, price, quantity, bill.id),
            bill.id
        )
            .then(response => {
                setItems(prevItems => [...prevItems, response.data]);
                setBillTotal(billTotal + (response.data.price * response.data.quantity));
                updateBillTotal(bill.id, billTotal + (response.data.price * response.data.quantity));
                // After adding the item, reset the newItem state
                // setNewItem({id: 0, description: '', price: 0, quantity: 0, person: {id: 0, name: ''}});
                setShowItemInput(false); // hide the input after adding the item
            })
            .catch(error => {
                console.error('Error adding item: ', error);
            })
    }

    const handleUpdateItem = (itemToUpdate: Item, description: string, price: number, quantity: number) => {
        updateItem(
            itemToUpdate.id,
            new NewItemRequest(description, price, quantity, bill.id),
            bill.id
        )
            .then(response => {
                setItems(items.map(item => {
                    if (item.id === itemToUpdate.id) {
                        return { ...item, description: response.data.description, price: response.data.price, quantity: response.data.quantity};
                    }
                    return item;
                }));
                setBillTotal((billTotal-(itemToUpdate.price * itemToUpdate.quantity)) + (response.data.price * response.data.quantity));
                updateBillTotal(bill.id, (billTotal-(itemToUpdate.price * itemToUpdate.quantity)) + (response.data.price * response.data.quantity));
            })
            .catch(error => {
                console.error('Error updating fee: ', error);
            })
    }

    const handleDeleteItem = (itemToRemove: Item) => {
        const itemPrice = itemToRemove.price;
        deleteItem(
            itemToRemove.id,
            bill.id
        )
            .then(() => {
                setItems(prevItems => prevItems.filter(item => item.id !== itemToRemove.id));
                setBillTotal(billTotal - itemPrice);
                updateBillTotal(bill.id, billTotal - itemPrice);
            })
            .catch(error => {
                console.error('Error deleteing item: ', error);
            })
    }

    const handleAddNewFee = (description: string, price: number) => {
        createFee(
            new NewFeeRequest(description, price, bill.id),
            bill.id
        )
            .then(response => {
                setFees(prevFees => [...prevFees, response.data]);
                setBillTotal(billTotal + response.data.price);
                updateBillTotal(bill.id, billTotal + response.data.price);
                setShowFeeInput(false);
            })
            .catch(error => {
                console.error('Error creating fee: ', error);
            })
    }

    const handleUpdateFee = (feeToUpdate: Fee, description: string, price: number) => {
        updateFee(
            feeToUpdate.id,
            new NewFeeRequest(description, price, bill.id),
            bill.id
        )
            .then(response => {
                setFees(fees.map(fee => {
                    if (fee.id === feeToUpdate.id) {
                        return { ...fee, description: response.data.description, price: response.data.price};
                    }
                    return fee;
                }));
                setBillTotal((billTotal-feeToUpdate.price) + response.data.price);
                updateBillTotal(bill.id, (billTotal-feeToUpdate.price)  + response.data.price);
            })
            .catch(error => {
                console.error('Error updating fee: ', error);
            })
    }

    const handleDeleteFee = (feeToRemove: Fee) => {
        const feePrice = feeToRemove.price
        deleteFee(feeToRemove.id, bill.id)
            .then(() => {
                setFees(prevFees => prevFees.filter(fee => fee.id !== feeToRemove.id));
                setBillTotal(billTotal - feePrice);
                updateBillTotal(bill.id, billTotal - feePrice);
            })
            .catch(error => {
                console.error('Error deleting fee: ', error);
            })
    }

    const dateFormatted = new Date(bill.date).toLocaleDateString('en-us', {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const titleFormatted = toTitleCase(bill.title)

    const totalFormatted = billTotal.toFixed(2)


    return (
        <Modal
            scroll
            width={"800px"}
            fullScreen={isMobile}
            closeButton
            aria-labelledby={"modal-title"}
            aria-describedby={"modal-description"}
            {...bindings}
        >
            <Modal.Header>
                <Typography
                    id={"modal-title"}
                    variant={"h2"}
                >
                    {titleFormatted}
                <Typography
                >
                    {dateFormatted}
                </Typography>
                </Typography>
            </Modal.Header>
            <Modal.Body>
                <TableContainer component={Paper}>
                    <Table
                        size="small"
                        aria-label="receipt items"
                    >
                        <TableHead>
                            <TableRow
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell style={{width:"10px"}}>No.</TableCell>
                                <TableCell component="th" scope="row">Name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell style={{width:"10px"}}>Quantity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <ItemRow
                                    key={index}
                                    item={item}
                                    number={index}
                                    price={item.price}
                                    deleteItem={handleDeleteItem}
                                    updateItem={handleUpdateItem}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div>
                    {showItemInput &&
                        <BillItemInput
                            onSave={handleAddNewItem}
                            onCancel={handleCancelItemInput}
                        />
                    }
                </div>
                <div className={"text-center"}>
                    <Button onClick={() => setShowItemInput(true)}>Add Item</Button>
                </div>
                <TableContainer component={Paper}>
                    <FeesList
                        fees={fees}
                        deleteFee={handleDeleteFee}
                        updateFee={handleUpdateFee}
                    />
                </TableContainer>
                <div>
                    {showFeeInput &&
                        <NewFeeInput
                            onSave={handleAddNewFee}
                            onCancel={handleCancelFeeInput}
                        />
                    }
                </div>
                <div className={"text-center"}>
                    <Button onClick={() => setShowFeeInput(true)}>Add Fee</Button>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Typography
                        variant="h6"
                    >
                        Total:
                    </Typography>
                    <Typography
                        variant="h6"
                        fontWeight="theme.typography.fontWeightRegular"
                        color="green"
                    >
                        ${totalFormatted}
                    </Typography>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
}