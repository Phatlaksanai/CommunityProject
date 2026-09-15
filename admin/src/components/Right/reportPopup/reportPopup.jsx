import "./reportPopup.scss";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

// Popup รายละเอียด Report ลอยมุมล่างขวา ใช้ได้จากหน้าไหนก็ได้ (Reports / Users / Content & Assets)
// รับ report (แถวที่กดมา) กับ onClose (ปิด popup) เป็น props
const ReportPopup = ({ report, onClose }) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        report_id: report.report_id,
        report_type: report.report_type || "",
        description: report.description || "",
        created_at: report.created_at || "",
        status: report.status || ""
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData) => {
            return makeRequest.put(`/admin/reports/updateReport/${updatedData.report_id}`, { status: updatedData.status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["getReportsTable"]); // เผื่อกลับไปหน้า Reports จะได้เห็นข้อมูลล่าสุด
            onClose();
        },
        onError: (err) => {
            setError("Error updating report: " + err.message);
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = () => {
        updateMutation.mutate(formData);
    };

    const togglePopupOpen = () => {
        setIsOpen((prev) => !prev);
    };

    // ฟังก์ชันสำหรับกำหนด Title ของ Popup ตามเงื่อนไข
    const renderPopupTitle = () => {
        const parts = [];
        if (report.target_id) parts.push(`User -${report.target_id}`);
        if (report.post_id) parts.push(`Post -${report.post_id}`);
        if (report.community_id) parts.push(`Community -${report.community_id}`);
        if (report.item_id) parts.push(`Item -${report.item_id}`);

        // ถ้ามีข้อมูลเป้าหมายอย่างน้อย 1 อย่าง ให้นำมาต่อกัน (เผื่อกรณีที่ report มีหลาย target พร้อมกัน)
        if (parts.length > 0) {
            return `Report: ${parts.join(' , ')}`;
        }
        
        // ถ้าไม่มีข้อมูล target อะไรเลย ให้ใช้ report_id เหมือนเดิม
        return `Report : ${report.report_id}`;
    };

    return (
        <div className={`report-popup ${isOpen ? "open" : "closed"}`}>
            <div className="report-popup-header" onClick={togglePopupOpen}>
                <h2>{renderPopupTitle()}</h2>
                <button
                    type="button"
                    className="toggle-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        togglePopupOpen();
                    }}
                    aria-label={isOpen ? "Expand" : "Collapse"}
                >
                    {isOpen ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                </button>
            </div>

            {!isOpen && (
                <div className="report-popup-body">
                    <div className="form-grid">
                        <div className="input-group full-width">
                            <label>report_type</label>
                            <input type="text" name="report_type" value={formData.report_type} readOnly />
                        </div>
                        <div className="input-group full-width">
                            <label>description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                rows="4"
                                placeholder="description..."
                                readOnly
                            />
                        </div>
                        <div className="input-group full-width">
                            <label>created_at</label>
                            <input type="text" name="created_at" value={formatDate(formData.created_at)} readOnly />
                        </div>
                        <div className="input-group full-width">
                            <label>status</label>
                            <div className="select-wrapper">
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="pending">pending</option>
                                    <option value="completed">completed</option>
                                    <option value="cancelled">cancelled</option>
                                </select>
                                <ArrowDropDownIcon className="dropdown-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={onClose} disabled={updateMutation.isLoading}>
                            Cancel
                        </button>
                        <button className="btn-update" onClick={handleUpdate} disabled={updateMutation.isLoading}>
                            {updateMutation.isLoading ? "Updating..." : "Submit"}
                        </button>
                    </div>
                    {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                </div>
            )}
        </div>
    );
};

export default ReportPopup;