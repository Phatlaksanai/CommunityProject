import LeftChat from "../../components/Left/leftChat/leftChat"
import {useContext, useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

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
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
    const queryClient = useQueryClient();
    const scrollRef = useRef();
    // const initialChatId = location.state?.activeChatId || null; // ดึงค่าจาก state มาเป็นค่าเริ่มต้น (ถ้าเข้ามาทาง RightBar จะมีค่านี้)

    // useEffect(() => { // ดักไว้เผื่อกรณีที่ผู้ใช้อยู่หน้า Chat อยู่แล้ว แต่ไปกดเพื่อนคนอื่นจาก RightBar
    //     if (location.state?.activeChatId) {
    //         setCurrentChatId(location.state.activeChatId);
    //     }
    // }, [location.state?.activeChatId]);

    // ดึงรายชื่อเพื่อนทั้งหมด เพื่อเอามาใช้เสิร์ช
    const { data: myFriends } = useQuery({
        queryKey: ["friends", id],
        queryFn: () => makeRequest.get(`/friends/${id}`).then((res) => res.data),
    });

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChat) return; // ถ้ายังไม่ได้เลือกใคร ให้หยุดไว้ก่อน
            try {
                const res = await makeRequest.get(`/chats/${currentChat.conversation_id}/messages`);
                setMessages(res.data);

                await makeRequest.put(`/chats/${currentChat.conversation_id}/read`, {
                    userId: id
                });
                queryClient.invalidateQueries({ queryKey: ["chats", id] });
            } catch (err) {
                console.log(err);
            }
        };
        fetchMessages();
    }, [currentChat, id, queryClient]);

    useEffect(() => { // สั่งให้เลื่อนจออัตโนมัติ ทุกครั้งที่ตัวแปร messages มีการอัปเดต
        scrollRef.current?.scrollIntoView({ behavior: "smooth" }); // เช็คว่ามี ref หรือยัง ถ้ามีให้เลื่อนลงมาหาแบบนุ่มนวล (smooth)
    }, [messages, filePreviews]);

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

                const updatedMessages = await makeRequest.get(`/chats/${currentChat.conversation_id}/messages`);
                setMessages(updatedMessages.data);

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

            // ดึงข้อความใหม่มาอัปเดตหน้าจอเหมือนตอนส่งข้อความปกติ
            const updatedMessages = await makeRequest.get(`/chats/${currentChat.conversation_id}/messages`);
            setMessages(updatedMessages.data);

            queryClient.invalidateQueries({ queryKey: ["chats", id] });
        } catch (err) {
            console.log("Error sending like:", err);
        }
    };

    // ฟังก์ชันกรองรายชื่อเพื่อนตามคำที่พิมพ์ค้นหา
    const filteredFriends = myFriends?.filter(friend => {
        if (!searchQuery) return false; // ถ้าไม่ได้พิมพ์อะไรเลย ก็ไม่ต้องโชว์
        return friend.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
               friend.name.toLowerCase().includes(searchQuery.toLowerCase());
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
                {/* <div className="search">
                    <input type="text" placeholder="Search..." />
                </div> */}
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
                            <div className="search-hit-item" style={{ textAlign: "center", color: "gray" }}>
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
                <div className="chatContent">
                    {currentChat ? (
                        <>
                            {messages.map((chat, index) => (
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
                                <ImageIcon style={{ cursor: "pointer" }} />
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
                            <ThumbUpAltIcon onClick={handleLikeSubmit} style={{ cursor: "pointer" }} />
                        </div>
                    )
                ) : null}
            </div>
        </div>

    )
}

export default Chat