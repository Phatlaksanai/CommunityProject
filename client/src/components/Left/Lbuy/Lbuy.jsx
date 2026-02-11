import "./Lbuy.scss";
import { useState } from "react";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WalletIcon from '@mui/icons-material/Wallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalParkingIcon from '@mui/icons-material/LocalParking';

const Lbuy = () => {
    const [filters, setFilters] = useState({
        paymentMethod: "CreditCard",
    });
    const handlepaymentChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            paymentMethod: value,
        }));
    };
    const dateLabels = {
        CreditCard: "Credit Card",
        TruemoneyWallet: "Truemoney Wallet",
        Paypal: "Paypal",
        BankTransfer: "Bank Transfer",
    };
    return (
        <div className="Lbuy">
            <div className="container">
                <p>Payment Methods</p>
                {Object.keys(dateLabels).map((item) => (
                    <label
                        key={item}
                        htmlFor={item}
                        className={`item ${filters.paymentMethod === item ? "active" : ""}`}
                    >
                    <input
                        type="radio"
                        id={item}
                        name="paymentMethod"
                        checked={filters.paymentMethod === item}
                        onChange={() => handlepaymentChange(item)}
                    />
                    {item === "CreditCard" && <CreditCardIcon />}
                    {item === "TruemoneyWallet" && <WalletIcon />}
                    {item === "Paypal" && <LocalParkingIcon />}
                    {item === "BankTransfer" && <AccountBalanceIcon />}
                    <h2>{dateLabels[item]}</h2>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default Lbuy;
