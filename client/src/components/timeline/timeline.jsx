import "./timeline.scss";
import { useState } from "react";
import { createPortal } from "react-dom"; // ย้ายไปอยู่ใต้ body ทำให้ component ไม่ทับกัน
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import dayjs from "dayjs";
import ModelViewer from "../modelViewer/model_viewer";
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const Timeline = ({ itemId, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const { isLoading, data: item, error } = useQuery({
        queryKey: ["itemTimeline", itemId],
        queryFn: () => makeRequest.get(`/items/${itemId}/timeline`).then((res) => res.data),
    });

    if (isLoading) return <div className="timeline">Loading...</div>;
    if (error) return <div className="timeline">Something went wrong!</div>;

    const currentUpdate = item.updates?.[currentIndex]; // เอาไว้ว่า ตอนนี้เรากำลังดู Update ตัวไหน .updates มาจาก backend
    const hasPrev = currentIndex > 0;                          // ใหม่กว่า
    const hasNext = currentIndex < (item.updates?.length ?? 0) - 1;    // เก่ากว่า ,ถ้า item.updates?.length ไม่มีค่า ให้ใช้ 0

    const goPrev = () => {
        if (hasPrev) setCurrentIndex((i) => i - 1);
    };
    const goNext = () => {
        if (hasNext) setCurrentIndex((i) => i + 1);
    };

    // หา theme เพราะ .timeline ถูกย้ายไปอยู่ใต้ <body> และ ไม่ได้อยู่ใต้ .theme-dark / .theme-light ที่ครอบหน้าเดิม
    const themeElement = document.querySelector(".theme-dark, .theme-light");
    const themeClass = themeElement?.classList.contains("theme-dark")
        ? "theme-dark"
        : "theme-light";

    return createPortal(
        <div className={`timeline-overlay ${themeClass}`}>
            <CloseIcon className="timeline-close" onClick={onClose} />

            {hasPrev && (
                <div className="timeline-nav timeline-nav-prev">
                    <ArrowBackIosIcon
                        sx={{ fontSize: 60 }} // sx คือ prop ของ MUI ที่ใช้เขียน CSS ให้ component นั้นโดยตรง
                        onClick={(e) => {
                            e.stopPropagation();
                            goPrev();
                        }}
                    />
                </div>
            )}

            <div className="timeline" onClick={(e) => e.stopPropagation()}>
                {currentUpdate ? (
                    <div className="timeline-item">
                        <div className="L">
                            <div className="image-box">
                                {currentUpdate.imgs?.[0]?.img ? (
                                    <img
                                        src={currentUpdate.imgs[0].img}
                                        alt={item.modelName}
                                    />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>

                            <div className="image-box">
                                {currentUpdate.imgs?.[1]?.img ? (
                                    <img
                                        src={currentUpdate.imgs[1].img}
                                        alt={item.modelName}
                                    />
                                ) : (
                                    <span>No Image</span>
                                )}
                            </div>
                        </div>
                        <div className="R">
                            {currentUpdate.model && (
                                <div className="model-box">
                                    <ModelViewer modelUrl={currentUpdate.model} />
                                </div>
                            )}
                        </div>
                        <div className="desc">
                            <h2>Version {currentUpdate.version}</h2>
                            <p>{currentUpdate.update_summary}</p>
                            <span>{dayjs(currentUpdate.created_at).format("D MMM YYYY")}</span>
                        </div>
                    </div>

                ) : (
                    <p>No updates</p>
                )}
            </div>

            {hasNext && (
                <div className="timeline-nav timeline-nav-next">
                    <ArrowForwardIosIcon
                        sx={{ fontSize: 60 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            goNext();
                        }}
                    />
                </div>
            )}

        </div>,
        document.body // <body> ของหน้าเว็บ
    );
};

export default Timeline;
