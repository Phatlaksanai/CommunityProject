import './descDownload.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const DescDownload = () => {
    const { id } = useParams();

    const [downloads, setDownloads] = useState([]);
    const [fileTypes, setFileTypes] = useState({});

    useEffect(() => {
        makeRequest.get(`/payments/downloads`).then(res => setDownloads(res.data));
    }, []);

    const handleDownload = (orderItemId) => {
        const type = fileTypes[orderItemId] || "obj";

        window.open(`${makeRequest.defaults.baseURL}/payments/download/${orderItemId}/${type}`, "_blank");
    };

    return (
        <div className="descDownload">
            <div className="container">
                <div className="Header">
                    <h2>Item</h2>
                    <h2>Price</h2>
                    <h2>Date</h2>
                    <h2>Download</h2>
                    <h2>Review</h2>
                </div>
                <hr />
                <div className="content">
                    {downloads.map(item => (
                        <div className="row" key={item.order_item_id}>
                            <h3>{item.items.modelName}</h3>
                            <h3>฿{item.items.price}</h3>
                            <h3>{new Date(item.orders.created_at).toLocaleDateString()}</h3>
                            <select
                                value={fileTypes[item.order_item_id] || "obj"}
                                onChange={(e) =>
                                    setFileTypes({
                                        ...fileTypes,
                                        [item.order_item_id]: e.target.value
                                    })
                                }
                            >
                                <option disabled={!item.items.obj} value="obj">OBJ</option>
                                <option disabled={!item.items.fbx} value="fbx">FBX</option>
                                <option disabled={!item.items.blend} value="blend">BLEND</option>
                                <option disabled={!item.items.usdz} value="usdz">USDZ</option>
                                <option disabled={!item.items.gltf} value="gltf">GLTF</option>
                            </select>

                            <button onClick={() => handleDownload(item.order_item_id)}>Download</button>
                            <button className="review-btn" >Review</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DescDownload;