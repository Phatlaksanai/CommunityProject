import LeftChat from "../../components/Left/leftChat/leftChat"
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { useQueryClient } from "@tanstack/react-query";

import "./chat.scss"
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const Chat = () => {
    const { id } = useParams();
    const location = useLocation();
    const [currentChat, setCurrentChat] = useState(location.state?.selectedChat || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
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
    }, [messages]);

    const handleKeyDown = async (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            const cleanMessage = newMessage.trim();
            if (!cleanMessage || !currentChat) return;

            try {
                const res = await makeRequest.post(`/chats/${currentChat.conversation_id}/messages`, {
                    text: cleanMessage
                });

                // อัปเดต State messages ทันที เพื่อให้ข้อความใหม่โผล่ขึ้นมาบนหน้าจอโดยไม่ต้องรีเฟรช
                setMessages([...messages, res.data]);
                setNewMessage("");  // เคลียร์ช่อง Input
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
                <LeftChat userId={id} currentChat={currentChat} setCurrentChat={setCurrentChat}/>
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

                {/* ส่วนช่อง Input พิมพ์ข้อความ */}
                <div className="chatInput">
                    <ImageIcon style={{ cursor: "pointer" }} />
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