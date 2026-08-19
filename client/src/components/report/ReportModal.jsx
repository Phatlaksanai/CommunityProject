import { useState } from "react";
import { makeRequest } from "../../api/axios"; // ปรับ path ให้ตรงกับโฟลเดอร์ที่เก็บไฟล์นี้
import "./ReportModal.scss";

const ReportModal = ({ isOpen, onClose, targetId, entityType, navbar }) => {
  const [type, setType] = useState(navbar ? "technical_issue" : "copyright");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmitReport = async (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช
    setError("");

    if (!description) {
      setError("Please enter description");
      return;
    }

    try {
      await makeRequest.post(`/reports/addreport/${targetId}`, {
        type: type,
        description: description,
        entityType: entityType,
      });

      // ส่งเสร็จแล้วให้เคลียร์ค่าและปิด Modal
      setDescription("");
      setType(navbar ? "technical_issue" : "copyright");
      onClose();
    } catch (error) {
      console.error("Report error:", error);
    }
  };

  return (
    <div className="ReportModal">
      <div className="modalContainer">
        <h3>Report</h3>
        <form onSubmit={handleSubmitReport}>
          <div className="form-group">
            <span>Report Type</span>
            {navbar ? (
              <select
                className="file-type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="technical_issue">technical_issue</option>
                <option value="bug">bug</option>
                <option value="feedback">feedback</option>
              </select>
            ) : (
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
            )
            }

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
            {error && <span style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{error}</span>}
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" style={{ backgroundColor: "#C0903B" }}>Confirm</button>
          </div>
        </form>
      </div>
    </div >
  );
};

export default ReportModal;