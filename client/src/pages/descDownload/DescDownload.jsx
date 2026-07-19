import './descDownload.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const DescDownload = () => {
    const { id } = useParams();

    const [downloads, setDownloads] = useState([]);
    const [fileTypes, setFileTypes] = useState({});
    const [openReview, setOpenReview] = useState(false);

    useEffect(() => {
        makeRequest.get(`/payments/downloads`).then(res => setDownloads(res.data));

        if (openReview) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };

    }, [openReview]);

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
                    <h2>Type</h2>
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
                            <select className="file-type-select"
                                value={fileTypes[item.order_item_id] || "obj"}
                                onChange={(e) =>
                                    setFileTypes({
                                        ...fileTypes,
                                        [item.order_item_id]: e.target.value
                                    })
                                }
                            > 
                                <option value="obj">OBJ</option>
                                <option value="fbx">FBX</option>
                                <option value="blend">BLEND</option>
                                <option value="usdz">USDZ</option>
                                <option value="gltf">GLTF</option>
                            </select>
                                {/* disabled={!item.items.obj}  */}
                            <button onClick={() => handleDownload(item.order_item_id)}>Download</button>
                            <button className="review-btn" onClick={() => setOpenReview(true)}>
                                Review
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {openReview && (
                <div className="ReviewModal">
                    <div className="modalContainer">
                        <h3>Review</h3>
                        <div className="form-group">
                            <span>Point</span>
                            <select className="file-type-select">
                                <option >5</option>
                                <option >4</option>
                                <option >3</option>
                                <option >2</option>
                                <option >1</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <span>Description</span>
                            <input type="text" id="description" placeholder="Description"
                                required />
                        </div>

                        <div className="modalButtons">
                            <button onClick={() => setOpenReview(false)}>Cancel</button>
                            <button onClick={() => setOpenReview(false)}>Confirm</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default DescDownload;