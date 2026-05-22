import "./leftChat.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";

const LeftChat = ({ userId }) => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

    const { isLoading, error, data = [] } = useQuery({
        queryKey: ["chats", userId],
        queryFn: () => {
            return makeRequest.get(`/chats/${userId}`).then(res => res.data);
        }
    });

    if (isLoading) return "Loading items...";
    if (error) return "Something went wrong!";

    console.log("Chat Data:", data);

    return (
        
        <div className="leftChat">
            {data.map((chat) => (
            <div className="container">
                <div className="menu">
                    <hr />
                    <div className="user">
                        
                        <img src={chat?.profilePic || defaultPic} alt="" />
                        <span className="custom-tooltip" data-tip={chat?.name || chat?.username || "Guest"}>
                            {chat?.name.length > 17 || chat?.username.length > 17 ? `${chat.name.substring(0, 17) || chat.username.substring(0, 17)}...` : chat?.name || chat?.username || "Guest"}
                        </span>
                        
                    </div>
                </div>
            </div>
            ))}
        </div>
        
    );
};

export default LeftChat;