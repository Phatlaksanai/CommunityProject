import LeftChat from "../../components/Left/leftChat/leftChat"
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import "./chat.scss"
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import CloseIcon from '@mui/icons-material/Close';

const Chat = () => {
    const { id } = useParams();
    const location = useLocation();
    const [currentChat, setCurrentChat] = useState(location.state?.selectedChat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [error, setError] = useState("");

    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
    const queryClient = useQueryClient();
    const scrollRef = useRef();
    // const initialChatId = location.state?.activeChatId || null; // ดึงค่าจาก state มาเป็นค่าเริ่มต้น (ถ้าเข้ามาทาง RightBar จะมีค่านี้)

    // useEffect(() => { // ดักไว้เผื่อกรณีที่ผู้ใช้อยู่หน้า Chat อยู่แล้ว แต่ไปกดเพื่อนคนอื่นจาก RightBar
    //     if (location.state?.activeChatId) {
    //         setCurrentChatId(location.state.activeChatId);
    //     }
    // }, [location.state?.activeChatId]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChat) return; // ถ้ายังไม่ได้เลือกใคร ให้หยุดไว้ก่อน
            try {
                const res = await makeRequest.get(`/chats/${currentChat.conversation_id}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchMessages();
    }, [currentChat]);

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
                        img: null
                    });
                }

                if (files.length > 0) { // ถ้ามีการเลือกรูปภาพ ให้อัปโหลดรูปภาพก่อน
                    for (const file of files) {
                        const uploadRes = await uploadFile(file); // อัปโหลดรูปนี้
                        
                        if (uploadRes?.url) {
                            // ส่งรูปลง Database โดยให้ text เป็นค่าว่าง
                            await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                                text: null,
                                img: uploadRes.url
                            });
                        }
                    }
                }

                const updatedMessages = await makeRequest.get(`/chats/${currentChat.conversation_id}/messages`);
                setMessages(updatedMessages.data);

                // อัปเดต State messages ทันที เพื่อให้ข้อความใหม่โผล่ขึ้นมาบนหน้าจอโดยไม่ต้องรีเฟรช
                setMessages([...messages, res.data]);
                setNewMessage("");  // เคลียร์ช่อง Input
                setFiles([]); // เคลียร์รูปภาพหลังส่ง
                setFilePreviews([]); // เคลียร์พรีวิว
                queryClient.invalidateQueries({ queryKey: ["chats", id] });
            } catch (err) {
                console.log("Error sending message:", err);
            }
        }
    };

    return (
        <div className="chat">
            <div className="Lchat">
                <div className="search">
                    <input type="text" placeholder="Search..." />
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
                                    {chat.imgs && chat.imgs.length > 0 && (
                                        <img src={chat.imgs[0].img} alt="attachment" className="chatImageMessage" />
                                    )}
                                    {/* สมมติว่าคอลัมน์ข้อความใน DB ของคุณชื่อ text */}
                                    <p>{chat.text}</p>
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

                {/* ส่วนช่อง Input พิมพ์ข้อความ */}
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
                    <ThumbUpAltIcon style={{ cursor: "pointer" }} />
                </div>
            </div>
        </div>

    )
}

export default Chat