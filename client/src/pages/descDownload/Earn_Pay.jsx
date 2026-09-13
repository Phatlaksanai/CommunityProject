import './earn_pay.scss';
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const Earn_Pay = () => {
    // แยก State ให้ตรงกับที่ Backend ส่งมา
    const [groupedEarnings, setGroupedEarnings] = useState([]);
    const [summaryStats, setSummaryStats] = useState({});
    const [payouts, setPayouts] = useState([]);

    useEffect(() => {
        makeRequest.get(`/transections`).then(res => {
            setGroupedEarnings(res.data.groupedEarnings);
            setSummaryStats(res.data.summaryStats);
            setPayouts(res.data.payouts);
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
                                <h2>Item</h2>
                                <h2>Price</h2>
                                <h2>Quantity</h2>
                                <h2>Total</h2>
                            </div>
                            <hr />
                        </div>

                        {/* ส่วนเนื้อหาที่สามารถเลื่อน (Scroll) ได้ */}
                        <div className="table-scroll-body">
                            <div className="content">
                                {groupedEarnings.map((item, index) => (
                                    <div className="row" key={index}>
                                        <div className="item-info">
                                            <div className="img">
                                                <img src={item.img} alt="" />
                                            </div>
                                            <h3 className="custom-tooltip" data-tip={item.model_name}>
                                                {item.model_name.length > 10 ? `${item.model_name.substring(0, 10)}...` : item.model_name}
                                            </h3>
                                        </div>
                                        <span>฿{item.total_amount / item.quantity}</span>
                                        <span>{item.quantity}</span>
                                        <span>฿{item.total_amount}</span>
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
                                {payouts.map(item => (
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
                        <h2 className="number">{Number(summaryStats.total_quantity || 0).toLocaleString()}</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Total Sale</h2>
                        <h2 className="number">{Number(summaryStats.total_sale || 0).toLocaleString()}</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Day Sale</h2>
                        <h2 className="number">{Number(summaryStats.day_sale || 0).toLocaleString()}</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Month Sale</h2>
                        <h2 className="number">{Number(summaryStats.month_sale || 0).toLocaleString()}</h2>
                    </div>
                    <div className="box">
                        <h2 className="title">Year Sale</h2>
                        <h2 className="number">{Number(summaryStats.year_sale || 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Earn_Pay;