import './descDownload.scss';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";

const DescDownload = () => {
    const { id } = useParams();

    const [downloads, setDownloads] = useState([]);

    // State สำหรับเก็บค่าที่เลือกของแต่ละแถว (อ้างอิงจาก order_item_id)
    const [selectedVersions, setSelectedVersions] = useState({});
    const [fileTypes, setFileTypes] = useState({});

    const [openReview, setOpenReview] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [point, setPoint] = useState(5);
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

    // *สำคัญ: คุณอาจจะต้องเปลี่ยนพารามิเตอร์เป็น updateModelId เพื่อให้หลังบ้านรู้ว่าโหลดไฟล์ของเวอร์ชันไหน
    const handleDownload = async (updateModelId, type) => {
        try {
            // แนะนำให้แก้ API ให้รับ ID ของเวอร์ชัน แทน orderItemId
            const response = await makeRequest.get(`/payments/download/${updateModelId}/${type}`);

            if (response.data.downloadUrl) {
                window.location.href = response.data.downloadUrl;
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    // ปรับฟังก์ชันให้รับ object ของเวอร์ชันที่เลือกมาเช็ก
    const getDefaultFileType = (model) => {
        if (!model) return "";
        if (model.obj) return "obj";
        if (model.fbx) return "fbx";
        if (model.blend) return "blend";
        if (model.usdz) return "usdz";
        if (model.gltf) return "gltf";
        return "";
    };

    const handleSubmitReview = async () => {
        try {
            await makeRequest.post(`/items/review`, {
                itemId: selectedItemId,
                points: point,
                description: description
            });

            setDownloads(prevDownloads =>
                prevDownloads.map(dl =>
                    dl.items.item_id === selectedItemId
                        ? { ...dl, is_reviewed: true }
                        : dl
                )
            );

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
                <div className="table-header-sticky">
                    <div className="Header">
                        <h2>Item</h2>
                        <h2>Price</h2>
                        <h2>Date</h2>
                        <h2>Version</h2> {/* เพิ่มคอลัมน์ Version */}
                        <h2>Type</h2>
                        <h2>Download</h2>
                        <h2>Review</h2>
                    </div>
                </div>
                <hr />
                <div className="table-scroll-body">
                    <div className="content">
                        {downloads.map(item => {
                            // 1. หา Index ของเวอร์ชันที่ถูกเลือก (ค่าเริ่มต้นคือ 0 หรือเวอร์ชันล่าสุด)
                            const currentVersionIdx = selectedVersions[item.order_item_id] || 0;
                            // 2. ดึงข้อมูลโมเดลของเวอร์ชันนั้นๆ ออกมา
                            const currentModel = item.items?.update_models?.[currentVersionIdx];
                            // 3. กำหนดประเภทไฟล์ปัจจุบัน
                            const currentType = fileTypes[item.order_item_id] || getDefaultFileType(currentModel);

                            return (
                                <div className="row" key={item.order_item_id}>
                                    <h3>{item.items?.modelName}</h3>
                                    <span>฿{item.items?.price}</span>
                                    <span>{new Date(item.orders.created_at).toLocaleDateString()}</span>

                                    {/* Dropdown 1: เลือก Version */}
                                    <select
                                        className="file-type-select"
                                        value={currentVersionIdx}
                                        onChange={(e) => {
                                            const newIdx = e.target.value;
                                            setSelectedVersions({
                                                ...selectedVersions,
                                                [item.order_item_id]: newIdx
                                            });
                                            // รีเซ็ต Type กลับเป็นค่า Default ของเวอร์ชันใหม่ที่เพิ่งเลือก
                                            const newModel = item.items?.update_models?.[newIdx];
                                            setFileTypes({
                                                ...fileTypes,
                                                [item.order_item_id]: getDefaultFileType(newModel)
                                            });
                                        }}
                                    >
                                        {item.items?.update_models?.map((model, idx) => (
                                            <option key={model.id || idx} value={idx}>
                                                {model.version || `${item.items.update_models.length - idx}`}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Dropdown 2: เลือก Type (แสดงเฉพาะฟอร์แมตที่มีในเวอร์ชันที่เลือก) */}
                                    <select
                                        className="file-type-select"
                                        value={currentType}
                                        onChange={(e) =>
                                            setFileTypes({
                                                ...fileTypes,
                                                [item.order_item_id]: e.target.value
                                            })
                                        }
                                    >
                                        {currentModel?.obj && <option value="obj">OBJ</option>}
                                        {currentModel?.fbx && <option value="fbx">FBX</option>}
                                        {currentModel?.blend && <option value="blend">BLEND</option>}
                                        {currentModel?.usdz && <option value="usdz">USDZ</option>}
                                        {currentModel?.gltf && <option value="gltf">GLTF</option>}
                                    </select>

                                    <button onClick={() => {
                                        // ส่ง ID ของโมเดลเวอร์ชันที่เลือก ไปให้ API ดาวน์โหลด
                                        handleDownload(currentModel?.update_models_id, currentType);
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
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Review Modal คงเดิม */}
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