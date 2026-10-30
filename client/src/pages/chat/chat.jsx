import LeftChat from "../../components/Left/leftChat/leftChat"
import { useContext, useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import "./chat.scss"
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CloseIcon from '@mui/icons-material/Close';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const Chat = () => {
    const { id } = useParams();
    const location = useLocation();
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentChat, setCurrentChat] = useState(location.state?.selectedChat || null);
    const [newMessage, setNewMessage] = useState("");

    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
    const queryClient = useQueryClient();
    const scrollRef = useRef();
    const chatContentRef = useRef(null); // ref ของกล่อง Chat สำหรับตรวจสอบและควบคุมตำแหน่ง Scroll
    const previousScrollHeightRef = useRef(0); // เก็บความสูงของ Chat ก่อนโหลดข้อความเก่า เพื่อรักษาตำแหน่ง Scroll เดิม
    const keepScrollPositionRef = useRef(false); // ตรวจสอบว่ากำลังรักษาตำแหน่ง Scroll หลังโหลดข้อความเก่าอยู่หรือไม่
    const hasUserScrolledRef = useRef(false); // ตรวจสอบว่าผู้ใช้เริ่มเลื่อน Chat แล้วหรือยัง
    const { ref: loadMoreRef, inView } = useInView(); // ตรวจสอบว่าจุดโหลดข้อความเก่าด้านบนอยู่ในหน้าจอหรือไม่

    // ดึงรายชื่อเพื่อนทั้งหมด เพื่อเอามาใช้เสิร์ช
    const { data: myFriends } = useQuery({
        queryKey: ["friends", id],
        queryFn: () => makeRequest.get(`/friends/${id}`).then((res) => res.data),
    });

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

        enabled: !!currentChat,

        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 15
                ? allPages.length
                : undefined;
        },
        refetchInterval: 3000, // เพิ่มบรรทัดนี้เพื่อดึงข้อมูลซ้ำอัตโนมัติทุกๆ 3 วินาที (3000 ms)
    });

    useEffect(() => {
        if (!currentChat) return;

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

        markAsRead(); // เรียกทำงานทันทีครั้งแรกที่เปิดแชท

        // ตั้งค่า Polling ดึงข้อความแชทใหม่ และอัปเดตสถานะ "อ่านแล้ว" ทุกๆ 3 วินาที
        const intervalId = setInterval(() => {
            // สั่งให้ React Query รีเฟรชข้อมูลข้อความแชท (เพื่อให้สถานะฝั่งคนส่งเปลี่ยนเป็น Read)
            queryClient.invalidateQueries({ queryKey: ["messages", currentChat.conversation_id] });
            markAsRead();// ส่งคำสั่งอัปเดตสถานะการอ่าน (เพื่อให้คนส่งรู้ว่าเราอ่านข้อความใหม่ที่เพิ่งเข้ามาแล้ว)
        }, 3000);

        // Cleanup interval ออกเมื่อผู้ใช้เปลี่ยนห้องแชทหรือออกนอกหน้า
        return () => clearInterval(intervalId);

    }, [currentChat, id, queryClient]);

    const handleLoadMore = async () => {
        if (!chatContentRef.current || !hasNextPage || isFetchingNextPage) return;

        previousScrollHeightRef.current = chatContentRef.current.scrollHeight;
        keepScrollPositionRef.current = true;

        await fetchNextPage();
    };

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && hasUserScrolledRef.current) {
            handleLoadMore();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        if (!chatContentRef.current || !messagesData) return;

        if (keepScrollPositionRef.current) {
            const newScrollHeight = chatContentRef.current.scrollHeight;

            chatContentRef.current.scrollTop =
                newScrollHeight - previousScrollHeightRef.current;

            keepScrollPositionRef.current = false;
        } else {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesData, filePreviews]);

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
        e.target.value = ""; // ล้างค่า input
    };
    const uploadFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await makeRequest.post("/upload/chat", formData);
            return res.data; // คาดหวัง { url: "..." }
        } catch (err) {
            console.log(err);
        }
    };
    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            const cleanMessage = newMessage.trim();
            if (!cleanMessage && files.length === 0) return;
            if (!currentChat) return;

            try {
                if (cleanMessage) {
                    await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                        text: cleanMessage,
                        img: null,
                        is_read: "sent"
                    });
                }

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

                queryClient.invalidateQueries({ queryKey: ["messages", currentChat.conversation_id] });

                // 4. ล้างหน่วยความจำของรูปพรีวิว (ป้องกัน Memory Leak)
                filePreviews.forEach(url => URL.revokeObjectURL(url));

                // 5. เคลียร์ค่าทั้งหมดหลังส่งสำเร็จ 🎉
                setNewMessage("");   // เคลียร์ช่องพิมพ์
                setFiles([]);        // เคลียร์ไฟล์
                setFilePreviews([]); // เคลียร์รูปพรีวิว
                queryClient.invalidateQueries({ queryKey: ["chats", id] });
            } catch (err) {
                console.log("Error sending message:", err);
            }
        }
    };

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

    // ฟังก์ชันกรองรายชื่อเพื่อนตามคำที่พิมพ์ค้นหา
    const filteredFriends = myFriends?.filter(friend => {
        if (!searchQuery) return false; // ถ้าไม่ได้พิมพ์อะไรเลย ก็ไม่ต้องโชว์

        const username = (friend.username ?? "").toLowerCase();
        const name = (friend.name ?? "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return username.includes(query) || name.includes(query);
        // return friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        //     friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleConversation = async (friend) => {
        try {
            const res = await makeRequest.post("/chats/createconversation", { user2Id: friend.user_id });

            // จัดรูปแบบ Object ให้ตรงกับที่ระบบแชทต้องการ
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
                                <div className="search-hit-item" key={friend.user_id} onClick={() => handleConversation(friend)} style={{ cursor: "pointer" }}>
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

            <div className="Rchat">
                {/* ส่วน Header ของแชท */}
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

                {/* ส่วนเนื้อหาแชทที่เลื่อนได้ */}
                <div className="chatContent" ref={chatContentRef} onScroll={() => { hasUserScrolledRef.current = true; }}>
                    {currentChat ? (
                        <>
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

                            {/* [...] ตรงนี้ใช้สำหรับสร้าง Array ใหม่ จาก messagesData.pages แล้วค่อย .reverse() เพื่อให้ข้อความเก่าอยู่ด้านบน ข้อความใหม่อยู่ด้านล่าง */}
                            {[...(messagesData?.pages || [])].reverse().map((page) =>
                                page.map((chat, index) => (
                                    // เช็คว่าใครเป็นคนส่ง เพื่อสลับฝั่งซ้ายขวา (ปรับ m.sender_id ให้ตรงกับ column ใน DB ของคุณ)
                                    <div
                                        key={chat.id || index}
                                        className={chat.sender_id === parseInt(id) ? "message own" : "message"}
                                    >
                                        <div className="messageWrapper">
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
                                )
                                ))}

                            <div ref={scrollRef} />
                        </>
                    ) : (
                        <span className="noConversationText">
                            Open a conversation to start a chat
                        </span>
                    )}
                </div>

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

                {/* ค้นหา tag โครงสร้าง <div className="chatInput"> เดิมของคุณ แล้วแก้สลับโครงสร้างแบบนี้ */}
                {currentChat ? (
                    // ตรวจสอบว่าคู่สนทนาที่เลือกพิมพ์ลบบัญชีไปแล้วหรือไม่ (อิงค่า isdelete ที่ส่งมาจากตารางร่วม)
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
                                />
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