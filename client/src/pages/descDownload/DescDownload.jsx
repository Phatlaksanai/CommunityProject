import './descDownload.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const DescDownload = () => {
    const { id } = useParams();

    return (
        <div className="descDownload">
            <div className="container">
                <div className="Header">
                    <h2>Item</h2>
                    <h2>Download</h2>
                    <h2>Review</h2>
                </div>
                <hr />
                <div className="content">
                    <h3>Balls</h3>
                    <button>Download V10.1.0</button>
                    <button className="review-btn">Review</button>
                </div>
            </div>
        </div>
    );
}

export default DescDownload;