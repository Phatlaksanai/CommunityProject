import './descDownload.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const DescDownload = () => {
    const { id } = useParams();

    const [downloads, setDownloads] = useState([]);
    const [fileTypes, setFileTypes] = useState({});

    const [openReview, setOpenReview] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null); // เก็บ item_id ของแถวที่กด
    const [point, setPoint] = useState(5); // เก็บดาว (ค่าเริ่มต้น 5)
    const [description, setDescription] = useState("");

    useEffect(() => {
        makeRequest.get(`/payments/downloads`).then(res => setDownloads(res.data));

        if (openReview) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "auto";
        };

    }, [openReview]);

    const handleDownload = async (orderItemId, type) => {
        try {
            // 1. ส่ง Request ไปขอ URL พร้อม Cookie ยืนยันตัวตน
            const response = await makeRequest.get(`/payments/download/${orderItemId}/${type}`);

            // 2. ถ้ามี URL ส่งกลับมา ให้เบราว์เซอร์ดาวน์โหลดไฟล์นั้นเลย
            if (response.data.downloadUrl) {
                window.location.href = response.data.downloadUrl;
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const getDefaultFileType = (items) => { // ฟังก์ชันนี้จะตรวจสอบว่ามีไฟล์ประเภทใดบ้างและเลือกประเภทแรกที่มีอยู่
        if (items.obj) return "obj";
        if (items.fbx) return "fbx";
        if (items.blend) return "blend";
        if (items.usdz) return "usdz";
        if (items.gltf) return "gltf";
        return "";
    };

    const handleSubmitReview = async () => {
        try {
            const response = await makeRequest.post(`/items/review`, {
                itemId: selectedItemId,
                points: point,
                description: description
            });

            // อัปเดต state downloads เพื่อให้ปุ่มของ item นี้กลายเป็น Complete ทันที
            setDownloads(prevDownloads =>
                prevDownloads.map(dl =>
                    dl.items.item_id === selectedItemId
                        ? { ...dl, is_reviewed: true }
                        : dl
                )
            );

            // ส่งเสร็จแล้วให้เคลียร์ค่าและปิด Modal
            setOpenReview(false);
            setPoint(5);
            setDescription("");
            setSelectedItemId(null);

        } catch (error) {
            console.error("Review error:", error);
        }
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
                            <span>฿{item.items.price}</span>
                            <span>{new Date(item.orders.created_at).toLocaleDateString()}</span>
                            <select className="file-type-select"
                                value={fileTypes[item.order_item_id] || getDefaultFileType(item.items)}
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
                            <button onClick={() => {
                                const typeToDownload = fileTypes[item.order_item_id] || getDefaultFileType(item.items); // ใช้ประเภทไฟล์ที่เลือกหรือประเภทเริ่มต้นถ้าไม่มีการเลือก
                                handleDownload(item.order_item_id, typeToDownload);
                            }}>Download</button>
                            {item.is_reviewed ? (
                                <span className="review-complete">Complete</span>
                            ) : (
                                <button className="review-btn"
                                    onClick={() => {
                                        setSelectedItemId(item.items.item_id);
                                        setOpenReview(true);
                                    }}
                                >
                                    Review
                                </button>
                            )}
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
                            <select className="file-type-select"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                                required >
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required />
                        </div>

                        <div className="modalButtons">
                            <button onClick={() => setOpenReview(false)}>Cancel</button>
                            <button onClick={handleSubmitReview}>Confirm</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default DescDownload;