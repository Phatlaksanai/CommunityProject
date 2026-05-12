import "./leftChat.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";

const LeftChat = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

    const displayName = currentUser?.name || currentUser?.username || "Guest";
    const truncatedName = displayName.length > 17 ? `${displayName.substring(0, 17)}...` : displayName;

    return (
        <div className="leftChat">
            <div className="container">
                
                <div className="menu">
                    <hr />
                    <div className="user">
                        <img src={currentUser?.profilePic || defaultPic} alt="" />
                        <span className="custom-tooltip" data-tip={displayName}>
                            {truncatedName}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftChat;