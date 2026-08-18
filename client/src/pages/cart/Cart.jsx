import "./cart.scss";
import { useQuery } from "@tanstack/react-query";
import CardItems from "../../components/PageItems/cards/carditems"
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useContext, useState, useMemo, useEffect } from "react";
import { AuthContext } from "../../context/authContext";

const Cart = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

    // State สำหรับเก็บ username ของคนขายที่ถูกเลือกฝั่งซ้าย
    const [selectedSeller, setSelectedSeller] = useState(null);

    const { isLoading, error: cartItemsError, data: cartItems } = useQuery({
        queryKey: ["cards", id],
        queryFn: () => {
            return makeRequest.get(`/payments/carditems/${id}`).then(res => res.data);
        }
    });

    // 1. นำ cartItems มาจัดกลุ่มตามคนขาย (อิงจาก username)
    const sellers = useMemo(() => { // useMemo เอาไว้เก็บ Cache ไม่ต้องคำนวณทุกครั้งที่หน้าเว็บมีการอัปเดต
        if (!cartItems) return [];

        const sellerMap = new Map();
        cartItems.forEach(item => {
            if (!sellerMap.has(item.username)) {
                sellerMap.set(item.username, {
                    username: item.username,
                    name: item.name,
                    profilePic: item.profilePic,
                    items: [] // เตรียม Array เปล่าสำหรับใส่สินค้าของคนนี้
                });
            }
            // ยัดสินค้าเข้า Array ของคนขายนั้นๆ
            sellerMap.get(item.username).items.push(item);
        });

        return Array.from(sellerMap.values());
    }, [cartItems]);

    // 2. เลือกคนขายคนแรกอัตโนมัติเมื่อโหลดข้อมูลเสร็จ
    useEffect(() => {
        if (sellers.length > 0 && !selectedSeller) {
            setSelectedSeller(sellers[0].username);
        }
    }, [sellers, selectedSeller]);

    // 3. ดึงเฉพาะสินค้าของคนขายที่ถูกเลือกไปส่งให้ <CardItems /> ฝั่งขวา
    const selectedItems = useMemo(() => {
        const seller = sellers.find(s => s.username === selectedSeller);
        return seller ? seller.items : [];
    }, [sellers, selectedSeller]);

    const cartId = cartItems?.length ? cartItems[0].cart_id : null; // cartItems ถูกส่งกลับเป็น array ต้องวนหา cart_id

    return (
        <div className="cart">
            <div className="container">

                <div className="leftPane">
                    {sellers.map((seller) => {
                        const displayName = seller.name || seller.username;
                        const truncatedName = displayName.length > 20 ? `${displayName.substring(0, 20)}...` : displayName;

                        return (
                            <div
                                key={seller.username}
                                className="sellerProfile"
                                onClick={() => setSelectedSeller(seller.username)}
                            >
                                <input
                                    type="radio"
                                    checked={selectedSeller === seller.username}
                                    readOnly
                                />
                                <img src={seller.profilePic || defaultPic} alt={seller.username} />
                                <span className="custom-tooltip" data-tip={displayName}>
                                    {truncatedName}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="rightPane">
                    <div className="cartItemWrapper">
                        <div className="cartItem">
                            <div className="left">
                                <CardItems items={selectedItems} isCart={true} />
                            </div>
                        </div>
                    </div>

                    <div className="checkoutBar">
                        <button onClick={() => navigate((`/buyitem/${currentUser.user_id}`), {
                            state: {
                                cartId: cartId,
                                selectedSeller: selectedSeller // ส่งคนขายที่เลือก
                            }
                        })} style={{ cursor: "pointer" }}>Check Out</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;