import "./buyitem.scss";
import Lbuy from "../../components/Left/Lbuy/Lbuy"
import CardItems from "../../components/PageItems/cards/carditems"
import { useLocation , useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useEffect, useState, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import stripePromise from "../../api/stripe";
import CloseIcon from '@mui/icons-material/Close';

import { useQuery } from "@tanstack/react-query";

const Buyitem = () => {
    const { id } = useParams();
    const { state } = useLocation();

    const item_id = state?.item_id;
    const paymentCreated = useRef(false);
    const [payment, setPayment] = useState(null);
    const navigate = useNavigate();

    const { isLoading, error, data: cartItems } = useQuery({
        queryKey: ["carditems", id ],
        queryFn: () => {
            return makeRequest.get(`/payments/carditems/${id}`).then(res => res.data);
        }
    });

    let subtotal = 0;
    if (cartItems) {
        // นำ price ของทุกชิ้นมาบวกกัน
        subtotal = cartItems.reduce((sum, item) => sum + item.price, 0); 
    }
    const platformFee = subtotal * 0.035; // คิด 3.5%
    const paymentFee = subtotal * 0.0165 + (subtotal * (0.0165 * 0.07));
    const totalAmount = subtotal + paymentFee + platformFee;

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
                                <CloseIcon onClick={() => navigate("/")} style={{ cursor: "pointer" }} />
                            </div>
                            <br />
                            {isLoading ? (
                                <span>Loading items...</span>
                            ) : error ? (
                                <span>Something went wrong!</span>
                            ) : (
                                <CardItems items={cartItems} />
                            )}
                            <br />
                            <div className="row">
                                <span>Subtotal</span> <span>฿{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span>Platform fee (3.5%)</span> <span>฿{platformFee.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span>Payment fee + VAT</span> <span>฿{paymentFee.toFixed(2)}</span>
                            </div>
                        </div>

                        <hr />
                        <div className="menu">
                             <div className="row">
                                <span>Total Amount</span> <span>฿{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="buttons">
                                <button onClick={() => navigate(`/download/${id}`)} style={{ cursor: "pointer" }}>Buy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Buyitem;