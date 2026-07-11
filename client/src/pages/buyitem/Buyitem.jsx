import "./buyitem.scss";
import Lbuy from "../../components/Left/Lbuy/Lbuy"
import Rbuy from "../../components/Right/Rbuy/Rbuy"
import { useLocation } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useEffect, useState, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import stripePromise from "../../api/stripe";

import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from "react-router-dom";

const Buyitem = () => {
    const { state } = useLocation();

    const item_id = state?.item_id;
    const paymentCreated = useRef(false);
    const [payment, setPayment] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (paymentCreated.current) return;
        const createPayment = async () => {

            paymentCreated.current = true;

            try {
                const res = await makeRequest.post(
                    "/payments/create-payment",
                    {
                        item_id: item_id
                    }
                );
                console.log(res.data.clientSecret);
                setPayment(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        if (item_id) {
            createPayment();
        }

    }, [item_id]);

    return (
        <div className="buyitem">
            <div className="Lbuyitem">
                {payment && (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: payment.clientSecret
                        }}
                    >
                        <Lbuy />
                    </Elements>
                )}
            </div>

            <div className="Rbuyitem" >
                <div className="Rbuy">
                    <div className="container">
                        <div className="menu">
                            <div className="header">
                                <span>Order Summary</span>
                                <CloseIcon onClick={() => navigate("/download")} style={{ cursor: "pointer" }} />
                            </div>
                            <br />
                            <Rbuy />
                            <br />
                            <div className="row">
                                <span>Subtotal</span> <span>฿500.00</span>
                            </div>
                            <div className="row">
                                <span>Platform fee (3.5%)</span> <span>฿1000.00</span>
                            </div>
                        </div>

                        <hr />
                        <div className="menu">
                            <span>Total Amount</span>
                            <div className="buttons">
                                <button>Buy</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <Rbuy /> */}
            </div>
        </div>
    );
};

export default Buyitem;