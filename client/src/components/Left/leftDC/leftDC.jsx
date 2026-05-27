import "./leftDC.scss";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useState, useEffect } from "react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

const LeftDC = ({ project, commuId }) => {
  const navigate = useNavigate();
  const [openAllimg, setOpenAllimg] = useState(false);

  // State สำหรับเก็บ Index ของรูปที่กำลังกดดูขนาดเต็ม (ถ้าเป็น null แปลว่าไม่ได้เปิดดูรูปใหญ่)
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const { data: latestImages = [], error, isLoading } = useQuery({
    queryKey: ["commuImages", commuId],
    queryFn: () => makeRequest.get(`/communities/${commuId}/images`).then(res => res.data)
  });

  // ล็อกไม่ให้หน้าจอหลักขยับสกรอลล์เวลาเปิด Modal หรือเปิดดูรูปใหญ่
  useEffect(() => {
    if (openAllimg || activeImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openAllimg, activeImageIndex]);

  // ฟังก์ชันสำหรับกดเลื่อนรูปไปทางซ้าย
  const handlePrevImage = (e) => {
    e.stopPropagation(); // กันไม่ให้ click ทะลุไปโดนพื้นหลัง
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : latestImages.length - 1));
  };

  // ฟังก์ชันสำหรับกดเลื่อนรูปไปทางขวา
  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < latestImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="leftDC">
      {/* --- ส่วนของหน้าจอปกติ --- */}
      <div className="container">
        <div className="item">
          <h2>Gallery</h2>
          <div className="img-container">
            {isLoading ? (
              <div className="loading-text">Loading...</div>
            ) : (
              latestImages.slice(0, 4).map((imgUrl, index) => (
                <div className="img" key={index} onClick={() => { setOpenAllimg(true); setActiveImageIndex(index); }}>
                  <img src={imgUrl} alt={`latest-${index}`} />
                </div>
              ))
            )}

            {!isLoading && latestImages.length < 4 &&
              Array(4 - latestImages.length).fill(0).map((_, i) => (
                <div className="img empty-slot" key={`empty-${i}`}>
                  <div className="no-image-text"><span>No Image</span></div>
                </div>
              ))
            }
          </div>
          <button onClick={() => setOpenAllimg(true)} disabled={isLoading}>View All</button>
        </div>
      </div>

      {/* --- 1. MODAL: หน้าต่างรวมรูปภาพทั้งหมด (เลื่อนสกรอลล์ได้แบบ Facebook) --- */}
      {openAllimg && (
        <div className="galleryModalOverlay" onClick={() => setOpenAllimg(false)}>
          <div className="galleryModalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>All Community Images ({latestImages.length})</h3>
              <button className="closeBtn" onClick={() => setOpenAllimg(false)}>
                <CloseIcon />
              </button>
            </div>

            {/* โซนนี้จะจัดเป็น Grid และตั้งความสูงให้ Scroll ได้ภายในตัว */}
            <div className="modalGridContent">
              {latestImages.map((imgUrl, index) => (
                <div
                  className="gridImgItem"
                  key={index}
                  onClick={() => setActiveImageIndex(index)} // คลิกแล้วจะเปิดเป็นรูปใหญ่
                >
                  <img src={imgUrl} alt={`gallery-${index}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- 2. LIGHTBOX: หน้าต่างดูรูปใหญ่เต็มจอ ซ้อนทับอีกชั้น (มีปุ่มซ้าย-ขวา) --- */}
      {activeImageIndex !== null && (
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
        </div>
      )}
    </div>
  );
};

export default LeftDC;