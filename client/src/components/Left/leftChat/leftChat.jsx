import "./leftChat.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useEffect } from "react";
import { makeRequest } from "../../../api/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs"; // moment to dayjs
import relativeTime from "dayjs/plugin/relativeTime";

// 1. เพิ่ม Import useInView เข้ามา
import { useInView } from "react-intersection-observer";

const LeftChat = ({ userId, setCurrentChat }) => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

    // 2. เรียกใช้ useInView สำหรับสร้าง ref แปะล่างสุดของแชท
    const { ref, inView } = useInView();

    const {
        data,
        status,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["chats", userId],
        queryFn: ({ pageParam = 0 }) => {
            return makeRequest.get(`/chats/${userId}?page=${pageParam}`).then(res => res.data);
        },
        getNextPageParam: (lastPage, allPages) => {
            // เช็คที่ 12 ตามลิมิตที่ Backend ของเราตั้งไว้
            return lastPage.length === 12 ? allPages.length : undefined;
        }
    });

    // 3. เมื่อเลื่อนมาถึงจุดที่แปะ ref ไว้ ให้สั่งโหลดหน้าถัดไปทันที
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    if (status === "pending") return "Loading items...";
    if (status === "error") return "Something went wrong!";

    dayjs.extend(relativeTime);

    return (
        <div className="leftChat">
            {data?.pages?.map((page, pageIndex) => (
                <div key={pageIndex}>
                    {page.map((chat, index) => (
                        <div className="container" key={chat?.conversation_id || index} onClick={() => setCurrentChat(chat)} style={{ cursor: "pointer" }}>
                            <div className="menu">
                                <div className="user">

                                    <img src={chat?.profilePic || defaultPic} alt="" />

                                    <div className="userDetails" >
                                        <span className="custom-tooltip" data-tip={chat?.name || chat?.username || "Guest"}>
                                            {chat?.name?.length > 17 || chat?.username?.length > 17
                                                ? `${(chat.name || chat.username).substring(0, 17)}...`
                                                : chat?.name || chat?.username || "Guest"}
                                        </span>

                                        <div className="details">
                                                
                                            <span style={{ fontSize: "14px", color: "gray", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {chat?.last_message || "Started a conversation"}
                                            </span>
                                            
                                                
                                            {chat?.last_message &&
                                                <span style={{ fontSize: "14px", color: "gray", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dayjs(chat?.updated_at).fromNow()}</span>
                                            }
                                           
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* 4. จุดล่างสุดที่ใช้ตรวจจับการเลื่อน */}
            <div ref={ref} style={{ padding: "10px", textAlign: "center", fontSize: "12px", color: "gray" }}>
                {isFetchingNextPage
                    ? "Loading more..."
                    : hasNextPage
                        ? "Scroll down to load more"
                        : "No more chats"}
            </div>
        </div>
    );
};

export default LeftChat;