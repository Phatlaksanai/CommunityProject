import "./cart.scss";
import { useQuery } from "@tanstack/react-query";
import CardItems from "../../components/PageItems/cards/carditems"
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Cart = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const { isLoading, error: cartItemsError, data: cartItems } = useQuery({
        queryKey: ["cards", id],
        queryFn: () => {
            return makeRequest.get(`/payments/carditems/${id}`).then(res => res.data);
        }
    });

    const cartId = cartItems?.length ? cartItems[0].cart_id : null; // cartItems ถูกส่งกลับเป็น array ต้องวนหา cart_id

    return (
        <div className="cart">
            <div className="container">

                <div className="cartItem">
                    <div className="left">
                        <CardItems items={cartItems} isCart={true} />
                    </div>
                </div>
            </div>

            <div className="checkoutBar">
                <button onClick={() => navigate((`/buyitem/${currentUser.user_id}`), {
                    state: {
                        cartId: cartId
                    }
                })} style={{ cursor: "pointer" }}>Check Out</button>
            </div>
        </div>
    );
};

export default Cart;