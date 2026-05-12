import "./friend.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const Friend = ({ user, isfriend }) => {

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const displayName = user.name || user.username;
    const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (userId) => {
            return makeRequest.post(`/friends/addfriend`, { receiver_id: userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["friend"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            navigate(`/managefriends/${currentUser.user_id}`);
            setSuccess("Friend Request Sent!");
        },
        onError: (err) => {
            console.error(err);
            setError("Failed to send friend request");
        }
    });

    const handleAddFriend = () => {
        mutation.mutate(user.user_id);
    };

    // Mutation สำหรับลบคำขอเพื่อน (Cancel/Unfriend)
    const cancelMutation = useMutation({
        mutationFn: (userId) => {
            // ใช้ path เดียวกับ decline เพราะ logic คือการลบ row ที่มี requester_id และ receiver_id ตรงกัน
            return makeRequest.delete("/friends/declinefriend", {
                data: { targetId: userId }
            });
        },
        onSuccess: () => {
            // รีเฟรชข้อมูลเพื่อน
            queryClient.invalidateQueries({ queryKey: ["friend"] });
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            setSuccess("Cancelled");
            setTimeout(() => setSuccess(""), 2000);
        },
        onError: (err) => {
            console.error(err);
            setError("Failed to cancel request");
        }
    });

    const handleCancelFriend = () => {
        cancelMutation.mutate(user.user_id);
    };

    const renderButton = () => {
        if (!isfriend) {

            return (
                <button
                    onClick={handleAddFriend}
                    disabled={mutation.isLoading}
                    style={{ cursor: mutation.isLoading ? "not-allowed" : "pointer" }}
                >
                    {mutation.isLoading ? "Sending..." : "Add +"}
                </button>
            );
        }
        if (user.status === 'pending') {
            return (
                <button onClick={handleCancelFriend}
                    disabled={cancelMutation.isLoading}
                    style={{ backgroundColor: "#ccc", cursor: cancelMutation.isLoading ? "not-allowed" : "pointer" }}
                >
                    Cancel Request
                </button>
            );
        }
        if (user.status === 'accepted') {
            return (
                <button disabled className="friend-btn accepted" style={{ backgroundColor: "#4dee20", color: "white" }}>
                    Friends
                </button>
            );
        }
    };

    return (
        <div className="friend">
            <div className="container">
                <div className="content" onClick={() => navigate(`/descitem/${user.user_id}`)} style={{ cursor: "pointer" }}>
                    <img src={user.profilePic} alt="" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Image+Error"; }} />
                </div>
                <div className="desc">
                    <h3 className="h3 custom-tooltip" data-tip={displayName}>
                        {truncatedName}
                    </h3>
                    <p>@{user.username}</p>
                </div>
            </div>
            <div className="actions">
                {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                {renderButton()}
            </div>
        </div>
    );
};

export default Friend;
