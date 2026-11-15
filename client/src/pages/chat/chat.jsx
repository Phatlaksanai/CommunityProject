import LeftChat from "../../components/Left/leftChat/leftChat"
import { useContext, useState, useEffect, Fragment, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { ClipLoader } from "react-spinners";
import "./chat.scss"
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CloseIcon from '@mui/icons-material/Close';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const Chat = () => {
    // รับค่า id จาก URL และรับข้อมูลห้องแชทที่ถูกเลือกมาจากหน้าอื่น
    const { id } = useParams();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);
    const [currentChat, setCurrentChat] = useState(location.state?.selectedChat || null);
    const [newMessage, setNewMessage] = useState("");

    // State สำหรับจัดการไฟล์แนบรูปภาพ พรีวิว
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [error, setError] = useState("");

    // State สำหรับช่องค้นหารายชื่อเพื่อนทางซ้าย
    const [searchQuery, setSearchQuery] = useState("");

    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
    const queryClient = useQueryClient();

    const { ref: loadMoreRef, inView } = useInView(); // ตัวจับสัญญาณว่าผู้ใช้เลื่อนหน้าจอไปถึงจุดบนสุดเพื่อโหลดข้อความเก่าหรือยัง
    const [isLoadingSpinner, setIsLoadingSpinner] = useState(false);

    // ตัวล็อคสำหรับป้องกันการกด Enter ส่งข้อความซ้ำรัวๆ
    const enterSendingLock = useRef(false);

    // ดึงรายชื่อเพื่อนทั้งหมด เพื่อเอามาใช้เสิร์ช
    const { data: myFriends } = useQuery({
        queryKey: ["friends", id],
        queryFn: () => makeRequest.get(`/friends/${id}`).then((res) => res.data),
    });

    // ดึงข้อมูลข้อความสนทนาแบบแบ่งหน้า (Infinite Scroll)
    const {
        data: messagesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["messages", currentChat?.conversation_id],

        queryFn: ({ pageParam = 0 }) => {
            return makeRequest
                .get(`/chats/${currentChat.conversation_id}/messages?page=${pageParam}`)
                .then((res) => res.data);
        },

        enabled: !!currentChat,// จะทำงานก็ต่อเมื่อมีการเลือกห้องแชทแล้วเท่านั้น
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 15
                ? allPages.length
                : undefined;
        },
        refetchInterval: 3000, // ดึงข้อมูลใหม่ทุกๆ 3 วินาที
    });

    useEffect(() => {
        if (!currentChat) return;
        // ฟังก์ชันสำหรับส่งคำสั่งเปลี่ยนสถานะข้อความเป็น "อ่านแล้ว"
        const markAsRead = async () => {
            try {
                await makeRequest.put(
                    `/chats/${currentChat.conversation_id}/read`,
                    {
                        userId: id
                    }
                );

                queryClient.invalidateQueries({
                    queryKey: ["chats", id]
                });
            } catch (err) {
                console.log(err);
            }
        };

        markAsRead(); // เรียกอัปเดตสถานะทันทีเมื่อเปิดห้องแชท

        // ตั้งเวลาตรวจสอบข้อความใหม่และปรับสถานะการอ่านทุก ๆ 3 วินาที
        const intervalId = setInterval(() => {
            // สั่งให้ React Query รีเฟรชข้อมูลข้อความแชท (เพื่อให้สถานะฝั่งคนส่งเปลี่ยนเป็น Read)
            queryClient.invalidateQueries({ queryKey: ["messages", currentChat.conversation_id] });
            markAsRead();// ส่งคำสั่งอัปเดตสถานะการอ่าน (เพื่อให้คนส่งรู้ว่าเราอ่านข้อความใหม่ที่เพิ่งเข้ามาแล้ว)
        }, 3000);

        // ล้างรอบการทำงานเมื่อเปลี่ยนแชทหรือออกนอกหน้า
        return () => clearInterval(intervalId);

    }, [currentChat, id, queryClient]);

    // ทริกเกอร์ให้โหลดหน้าถัดไปเมื่อเลื่อนแชทไปถึงด้านบน
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ฟังก์ชันจัดการการเลือกไฟล์รูปภาพ
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => {
            if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
                setError("Please select JPG, PNG, or GIF files only");
                return false;
            }
            return true;
        });

        setError("");
        setFiles((prev) => prev.concat(validFiles));

        // สร้าง URL สำหรับพรีวิวภาพ
        const previews = validFiles.map((file) => URL.createObjectURL(file));
        setFilePreviews((prev) => prev.concat(previews));
        e.target.value = ""; // รีเซ็ต input ให้กดเลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
    };

    // ฟังก์ชันอัปโหลดรูป
    const uploadFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await makeRequest.post("/upload/chat", formData);
            return res.data;
        } catch (err) {
            console.log(err);
        }
    };

    // ลบไฟล์รูปภาพที่พรีวิวไว้ก่อนกดส่ง
    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // จัดการเมื่อกด Enter เพื่อส่งข้อความ
    const handleKeyDown = async (event) => {
        // ต้องกด Enter โดยไม่กด Shift
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            // ป้องกันการส่งซ้ำขณะโหลด
            if (enterSendingLock.current) return;

            const cleanMessage = newMessage.trim();
            if (!cleanMessage && files.length === 0) return;
            if (!currentChat) return;

            // ล็อกทันที
            enterSendingLock.current = true;
            setIsLoadingSpinner(true);

            try {
                // ส่งข้อความอักษร
                if (cleanMessage) {
                    await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                        text: cleanMessage,
                        img: null,
                        is_read: "sent"
                    });
                }

                // ส่งรูปภาพ (ถ้ามี) อัปโหลดและส่งเข้าห้องแชททีละรูป
                if (files.length > 0) { // ถ้ามีการเลือกรูปภาพ ให้อัปโหลดรูปภาพก่อน
                    for (const file of files) {
                        const uploadRes = await uploadFile(file); // อัปโหลดรูปนี้

                        if (uploadRes?.url) {
                            // ส่งรูปลง Database โดยให้ text เป็นค่าว่าง
                            await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                                text: null,
                                img: uploadRes.url,
                                is_read: "sent"
                            });
                        }
                    }
                }

                // รีเฟรชแชทให้โชว์ข้อความใหม่
                queryClient.invalidateQueries({ queryKey: ["messages", currentChat.conversation_id] });

                // ล้างหน่วยความจำของรูปพรีวิว (ป้องกัน Memory Leak)
                filePreviews.forEach(url => URL.revokeObjectURL(url));

                // เคลียร์สถานะกลับเป็นค่าเริ่มต้น
                setNewMessage("");   // เคลียร์ช่องพิมพ์
                setFiles([]);        // เคลียร์ไฟล์
                setFilePreviews([]); // เคลียร์รูปพรีวิว
                queryClient.invalidateQueries({ queryKey: ["chats", id] });
            } catch (err) {
                console.log("Error sending message:", err);
            } finally {
                enterSendingLock.current = false;
                setIsLoadingSpinner(false);
            }
        }
    };

    // ฟังก์ชันสำหรับปุ่มส่งไลค์
    const handleLikeSubmit = async () => {
        if (!currentChat) return;

        try {
            // ส่งข้อความคีย์เวิร์ด หรืออิโมจิ 👍 เข้าไปตรงๆ
            await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                text: "👍",
                img: null,
                is_read: "sent"
            });

            queryClient.invalidateQueries({ queryKey: ["messages", currentChat.conversation_id] });
            queryClient.invalidateQueries({ queryKey: ["chats", id] });
        } catch (err) {
            console.log("Error sending like:", err);
        }
    };

    // ระบบค้นหาเพื่อน พิมพ์หาตามชื่อ (name) หรือ (username)
    const filteredFriends = myFriends?.filter(friend => {
        if (!searchQuery) return false; // ถ้าไม่ได้พิมพ์อะไรเลย ก็ไม่ต้องโชว์

        const username = (friend.username ?? "").toLowerCase();
        const name = (friend.name ?? "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return username.includes(query) || name.includes(query);
    });

    // เริ่มต้นหรือเข้าห้องแชทกับเพื่อนที่เสิร์ชเจอ
    const handleConversation = async (friend) => {
        try {
            const res = await makeRequest.post("/chats/createconversation", { user2Id: friend.user_id });

            const chatData = {
                conversation_id: res.data.conversation_id,
                partner_id: friend.user_id,
                username: friend.username,
                name: friend.name,
                profilePic: friend.profilePic,
            };

            queryClient.invalidateQueries(["rightBar", currentUser?.user_id]);

            setCurrentChat(chatData);
            setSearchQuery("");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="chat">
            {/* ซีกซ้ายของหน้าจอ: สำหรับค้นหาเพื่อนและแสดงประวัติแชท */}
            <div className="Lchat">
                <div className="search-container-local">
                    <div className="search-box-wrapper">
                        <SearchOutlinedIcon className="search-icon-inside" />
                        <input
                            type="text"
                            placeholder="Search Friends"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="local-search-input"
                        />
                    </div>

                    {/* แสดงผลลัพธ์รายชื่อเพื่อนที่ค้นเจอ */}
                    {searchQuery && filteredFriends?.length > 0 && (
                        <div className="search-dropdown-results">
                            {filteredFriends?.map((friend) => (
                                <div className="search-hit-item" key={friend.user_id} onClick={() => handleConversation(friend)} >
                                    <div className="hit-content">
                                        <img src={friend.profilePic || defaultPic} className="hit-image" />
                                        <div className="hit-info">
                                            <span className="badge user">FRIEND</span>
                                            <h4 className="hit-title">{friend.name || friend.username}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery && filteredFriends?.length === 0 && (
                        <div className="search-dropdown-results">
                            <div className="search-hit-item" style={{ textAlign: "center", color: "gray", fontWeight: "bold" }}>
                                No friends found
                            </div>
                        </div>
                    )}
                </div>

                <LeftChat userId={id} currentChat={currentChat} setCurrentChat={setCurrentChat} />
            </div>

            {/* ซีกขวาของหน้าจอ: บริเวณห้องสนทนา */}
            <div className="Rchat">
                <div className="chatHeader">
                    <div className="userInfo">
                        {currentChat ? (
                            <>
                                <img src={currentChat?.profilePic || defaultPic} alt="" />
                                <div className="online" />
                                <span>{currentChat?.name || currentChat?.username}</span>
                            </>
                        ) : (
                            <span>Please select a conversation</span>
                        )}
                    </div>
                </div>

                {/* พื้นที่โชว์แชท */}
                <div className="chatContent">
                    {currentChat ? (
                        <>
                            {/*วนลูปข้อความ โดยเอาข้อความใหม่ล่าสุดไว้บนสุดของโค้ด (ซึ่งจะไปแสดงล่างสุดของจอ) */}
                            {messagesData?.pages?.map((page, pageIndex) => (
                                // Fragment เอาไว้แทน div คือไม่มีแท็กครอบ
                                <Fragment key={pageIndex}>
                                    {[...page].map((chat, index) => (
                                        <div
                                            key={chat.id || index}
                                            className={chat.sender_id === parseInt(id) ? "message own" : "message"} 
                                            // แยก class ดูว่าข้อความใคร
                                        >
                                            <div className="messageWrapper">
                                                {/* ข้อความฝั่งคนอื่น */}
                                                {chat.sender_id !== parseInt(id) && (
                                                    <>
                                                        <div className="messageContent">
                                                            {chat.imgs && chat.imgs.length > 0 && (
                                                                <img src={chat.imgs[0].img} alt="attachment" className="chatImageMessage" />
                                                            )}
                                                            {chat.text && <p>{chat.text}</p>}
                                                        </div>
                                                        <div className="messageInfo">
                                                            <span>{dayjs(chat.created_at).format("h:mm A")}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {/* ข้อความฝั่งเรา (ส่งเอง) */}
                                                {chat.sender_id === parseInt(id) && (
                                                    <>
                                                        <div className="messageInfo">
                                                            <span>{chat.is_read === "read" ? "Read" : "Sent"}</span>
                                                            <span>{dayjs(chat.created_at).format("h:mm A")}</span>
                                                        </div>
                                                        <div className="messageContent">
                                                            {chat.imgs && chat.imgs.length > 0 && (
                                                                <img src={chat.imgs[0].img} alt="attachment" className="chatImageMessage" />
                                                            )}
                                                            {chat.text && <p>{chat.text}</p>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </Fragment>
                            ))}
                            {/* ตัวตรวจสอบตำแหน่งการเลื่อนจอ เพื่อทริกเกอร์โหลดข้อความหน้าถัดไป (เก่าขึ้น) */}
                            <div
                                ref={loadMoreRef}
                                style={{
                                    padding: "20px",
                                    textAlign: "center",
                                    color: "#ffffff"
                                }}
                            >
                                {isFetchingNextPage
                                    ? "Loading..."
                                    : hasNextPage
                                        ? "Scroll up to load older messages"
                                        : "No more older messages"}
                            </div>
                        </>
                    ) : (
                        <span className="noConversationText">
                            Open a conversation to start a chat
                        </span>
                    )}
                </div>

                {/* กล่องพรีวิวรูปภาพก่อนกดส่ง */}
                {filePreviews.length > 0 && (
                    <div className="imagePreviewContainer">
                        {filePreviews.map((preview, i) => (
                            <div className="previewItem" key={i}>
                                <img src={preview} alt="preview" />
                                <button onClick={() => removeFile(i)}><CloseIcon fontSize="small" /></button>
                            </div>
                        ))}
                    </div>
                )}
                {error && <span style={{ color: "red", padding: "0 20px", fontSize: "12px" }}>{error}</span>}

                {/* ช่องพิมพ์ข้อความด้านล่างสุด */}
                {currentChat ? (
                    // หากผู้ใช้ปลายทางลบบัญชีแล้ว จะแสดงหน้าต่างแจ้งเตือนและปิดกล่องพิมพ์
                    currentChat.isdelete === "deleted" ? (
                        <div className="chatInputDisabled">
                            This account has been deleted. You can no longer send messages to this conversation.
                        </div>
                    ) : (
                        <div className="chatInput">
                            <input
                                type="file"
                                id="chatImageInput"
                                accept=".png,.jpg,.jpeg,.gif"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            <label htmlFor="chatImageInput">
                                <ImageIcon style={{ cursor: "pointer", color: "#6A9043" }} />
                            </label>
                            <div className="search">
                                <textarea
                                    type="text"
                                    placeholder="Text..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    className="chatTextArea"
                                    disabled={isLoadingSpinner}
                                />
                                {isLoadingSpinner && (
                                    <ClipLoader size={16} color="#ffffff" />
                                )}
                            </div>
                            <ThumbUpAltIcon onClick={handleLikeSubmit} style={{ cursor: "pointer", color: "#A0C46E" }} />
                        </div>
                    )
                ) : null}
            </div>
        </div>
    )
}

export default Chat