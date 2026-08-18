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
    
    const cart_id = state?.cartId;
    const selectedSeller = state?.selectedSeller;

    const paymentCreated = useRef(false);
    const [payment, setPayment] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const { isLoading, error: cartItemsError, data: cartItems } = useQuery({
        queryKey: ["carditems", id ],
        queryFn: () => {
            return makeRequest.get(`/payments/carditems/${id}`).then(res => res.data);
        }
    });

    // กรองสินค้าให้เหลือเฉพาะของคนขายที่ถูกเลือก
    const filteredItems = cartItems ? cartItems.filter(item => item.username === selectedSeller) : [];

    let subtotal = 0;
    if (filteredItems.length > 0) {
        // นำ price ของเฉพาะชิ้นที่กรองแล้วมาบวกกัน
        subtotal = filteredItems.reduce((sum, item) => sum + item.price, 0); 
    }

    const platformFee = subtotal * 0.035; 
    const netTarget = subtotal + platformFee; // ยอดสุทธิที่ต้องการให้เหลือหลังหัก Stripe
    
    const effectiveFeeRate = 0.0165 * (1 + 0.07); // 0.017655 (ค่าธรรมเนียม Stripe + VAT)
    
    const totalAmount = netTarget / (1 - effectiveFeeRate); // ยอดที่ต้องชาร์จจริง
    const paymentFee = totalAmount - netTarget; // ค่าธรรมเนียม Stripe ที่แสดงให้ฝั่ง Client เห็น

    useEffect(() => {
        if (paymentCreated.current) return;
        const createPayment = async () => {

            paymentCreated.current = true;

            try {
                const res = await makeRequest.post(
                    "/payments/createpayment",
                    {
                        cartId: cart_id,
                        sellerUsername: selectedSeller,
                        userId: id
                    }
                );
                setPayment(res.data);
            } catch (error) {
                setError(error.response.data.error);
            }
        };

        if (cart_id && selectedSeller) {
            createPayment();
        }

    }, [cart_id, selectedSeller, id]);

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
                {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
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
                            ) : cartItemsError ? (
                                <span>Something went wrong!</span>
                            ) : (
                                <CardItems items={filteredItems} />
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