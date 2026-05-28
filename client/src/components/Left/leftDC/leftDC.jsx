import "./leftDC.scss";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

const LeftDC = ({ project, commuId }) => {
  const navigate = useNavigate();

  // State สำหรับคุมการเปิดขยายรูปภาพภายในกล่องแกลลอรี่ฝั่งซ้าย
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State สำหรับเก็บ Index ของรูปที่กำลังกดดูขนาดเต็ม (Lightbox)
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const { data: latestImages = [], error, isLoading } = useQuery({
    queryKey: ["commuImages", commuId],
    queryFn: () => makeRequest.get(`/communities/${commuId}/images`).then(res => res.data)
  });

  // ล็อกไม่ให้หน้าจอหลักขยับสกรอลล์เวลาเปิดดูรูปใหญ่เต็มจอ
  useEffect(() => {
    if (activeImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeImageIndex]);

  // ฟังก์ชันสำหรับกดเลื่อนรูปไปทางซ้าย
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : latestImages.length - 1));
  };

  // ฟังก์ชันสำหรับกดเลื่อนรูปไปทางขวา
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < latestImages.length - 1 ? prev + 1 : 0));
  };

  // คำนวณชุดรูปภาพที่จะนำมาแสดงผลบนหน้าจอปกติ
  // ถ้ายังไม่กดปุ่มขยาย (isExpanded เป็น false) จะหั่นเอามาแค่ 4 รูปแรกเท่านั้น
  const displayImages = isExpanded ? latestImages : latestImages.slice(0, 4);

  return (
    <div className="leftDC">
      {/* --- ส่วนของหน้าจอปกติ --- */}
      <div className="container">
        <div className="item">
          <h2>Gallery ({latestImages.length})</h2>
          
          {/* เปิดระบบ Scroll แนวตั้งเฉพาะตอนที่เปิดสถานะ expanded เท่านั้น */}
          <div className={`img-container ${isExpanded ? "expanded" : ""}`}>
            {isLoading ? (
              <div className="loading-text">Loading...</div>
            ) : (
              displayImages.map((imgUrl, index) => (
                <div className="img" key={index} onClick={() => setActiveImageIndex(index)}>
                  <img src={imgUrl} alt={`latest-${index}`} />
                </div>
              ))
            )}

            {/* ช่องว่างตัวอย่าง (Empty Slot) แสดงเฉพาะตอนยังไม่ขยาย และรูปที่มีจริงดันน้อยกว่า 4 รูป */}
            {!isLoading && !isExpanded && latestImages.length < 4 &&
              Array(4 - latestImages.length).fill(0).map((_, i) => (
                <div className="img empty-slot" key={`empty-${i}`}>
                  <div className="no-image-text"><span>No Image</span></div>
                </div>
              ))
            }

            {/* กรณีไม่มีรูปในกลุ่มนี้เลยแม้แต่รูปเดียว */}
            {!isLoading && latestImages.length === 0 && (
              <div className="img empty-slot main-empty">
                <div className="no-image-text"><span>No Image</span></div>
              </div>
            )}
          </div>

          {/* ปุ่มสลับสถานะ: แสดงเมื่อรูปภาพทั้งหมดในระบบมีมากกว่า 4 รูปขึ้นไป */}
          {!isLoading && latestImages.length > 4 && (
            <button 
              className="view-all-btn" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "View All"}
            </button>
          )}
        </div>
      </div>

      {/* --- LIGHTBOX: หน้าต่างดูรูปใหญ่เต็มจอ ซ้อนทับอีกชั้น ยิงพอร์ทัลออกไปครอบสูงสุด --- */}
      {activeImageIndex !== null && createPortal(
        <div className="lightboxOverlay" onClick={() => setActiveImageIndex(null)}>
          {/* ปุ่มปิดรูปใหญ่ */}
          <button className="lightboxCloseBtn" onClick={() => setActiveImageIndex(null)}>
            <CloseIcon fontSize="large" />
          </button>

          {/* ปุ่มเลื่อนซ้าย */}
          <button className="navBtn prev" onClick={handlePrevImage}>
            <ArrowBackIosNewIcon />
          </button>

          {/* กล่องแสดงรูปใหญ่ */}
          <div className="lightboxContent" onClick={(e) => e.stopPropagation()}>
            <img src={latestImages[activeImageIndex]} alt="Full view" />
          </div>

          {/* ปุ่มเลื่อนขวา */}
          <button className="navBtn next" onClick={handleNextImage}>
            <ArrowForwardIosIcon />
          </button>

          {/* ตัวเลขบอกตำแหน่งรูปภาพด้านล่าง */}
          <div className="imageCounter">
            {activeImageIndex + 1} / {latestImages.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeftDC;