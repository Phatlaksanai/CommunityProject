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
            <div className="container">
                <div className="Header">
                    <h2>Item Name</h2>
                    <h2>Amount</h2>
                    <h2>Type</h2>
                    <h2>Date</h2>
                </div>
                <hr />
                <div className="content">
                    {transection.map(item => (
                        <div className="row" key={item.transaction_id}>
                            <h3>{item.order_items?.items?.modelName || "-"}</h3>
                            <span>฿{item.amount}</span>
                            <span>{item.transaction_type}</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Transection;