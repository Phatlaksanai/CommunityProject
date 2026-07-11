import "./buyitem.scss";
import Lbuy from "../../components/Left/Lbuy/Lbuy"
import Rbuy from "../../components/Right/Rbuy/Rbuy"
import { useLocation } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useEffect, useState, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import stripePromise from "../../api/stripe";

const Buyitem = () => {
    const { state } = useLocation();

    const item_id = state?.item_id;
    const paymentCreated = useRef(false);
    const [payment, setPayment] = useState(null);


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

            <div className="Rbuyitem">
                <Rbuy />
            </div>
        </div>
    );
};

export default Buyitem;