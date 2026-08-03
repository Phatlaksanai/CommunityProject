import { useState } from "react";
import { makeRequest } from "../../api/axios"; // ปรับ path ให้ตรงกับโฟลเดอร์ที่เก็บไฟล์นี้

const ReportModal = ({ isOpen, onClose, targetId, entityType }) => {
  const [type, setType] = useState("copyright");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmitReport = async () => {
    try {
      await makeRequest.post(`/reports/addreport/${targetId}`, {
        type: type,
        description: description,
        entityType: entityType,
      });

      // ส่งเสร็จแล้วให้เคลียร์ค่าและปิด Modal
      setDescription("");
      setType("copyright");
      onClose();
    } catch (error) {
      console.error("Report error:", error);
    }
  };

  return (
    <div className="ReviewModal">
      <div className="modalContainer">
        <h3>Report</h3>
        <div className="form-group">
          <span>Report Type</span>
          <select
            className="file-type-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="copyright">copyright</option>
            <option value="inappropriate">inappropriate</option>
            <option value="spam">spam</option>
            <option value="scam">scam</option>
            <option value="other">other</option>
          </select>
        </div>

        <div className="form-group">
          <span>Description</span>
          <input
            type="text"
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modalButtons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmitReport}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;