import './transection.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const Transection = () => {
    const [transection, setTransection] = useState([]);

    useEffect(() => {
        makeRequest.get(`/transections`).then(res => {
            console.log("API Data:", res.data);
            setTransection(res.data);
        });
    }, []);

    return (
        <div className="transection">
            <div className="top">
                <div className="L">
                    <div className="container">
                        <span className="title">Earnings</span>

                        {/* ส่วนหัวที่ต้องการล็อคให้อยู่กับที่ */}
                        <div className="table-header-sticky">
                            <div className="Header">
                                <h2>Item Name</h2>
                                <h2>Amount</h2>
                                <h2>Type</h2>
                                <h2>Date</h2>
                            </div>
                            <hr />
                        </div>

                        {/* ส่วนเนื้อหาที่สามารถเลื่อน (Scroll) ได้ */}
                        <div className="table-scroll-body">
                            <div className="content">
                                {transection.map(item => (
                                    <div className="row" key={item.transaction_id}>
                                        <div className="item-info">
                                            {/* ใส่แท็ก img หรือกล่อง placeholder สำหรับรูปภาพ */}
                                            <div className="img">
                                                <img src={item.order_items?.items?.img} alt="" />
                                            </div>

                                            {(() => {
                                                const displayName = item.order_items?.items?.modelName || "-";
                                                return (
                                                    <h3 style={{ cursor: "pointer" }}>
                                                        {displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName}
                                                    </h3>
                                                );
                                            })()}
                                        </div>
                                        <span>฿{item.amount}</span>
                                        <span>{item.transaction_type}</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="R">
                    <div className="container">
                        <span className="title">Payouts</span>

                        {/* ส่วนหัวฝั่งขวาที่ต้องการล็อค */}
                        <div className="table-header-sticky">
                            <div className="Header">
                                <h2>Amount</h2>
                                <h2>Date</h2>
                            </div>
                            <hr />
                        </div>

                        {/* ส่วนเนื้อหาฝั่งขวาที่เลื่อนได้ */}
                        <div className="table-scroll-body">
                            <div className="content">
                                {transection.map(item => (
                                    <div className="row" key={item.transaction_id}>
                                        <span>฿{item.amount}</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <div className="All">
                    <div className="box">
                        <h2 className="title">Total Quantity</h2>
                        <h2 className="number">50</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Total Sale</h2>
                        <h2 className="number">50,000</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Day Sale</h2>
                        <h2 className="number">5,000</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Month Sale</h2>
                        <h2 className="number">50,000</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Year Sale</h2>
                        <h2 className="number">500,000</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Transection;