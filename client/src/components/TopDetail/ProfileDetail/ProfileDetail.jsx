import "./profileDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";


const ProfileDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const isOwner = currentUser?.user_id == id;

  const { isLoading, error: userError, data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: () => makeRequest.get(`/friends/userprofile/${id}`).then((res) => res.data),
  });

  const { data: friendsList } = useQuery({
    queryKey: ["friendships", currentUser?.user_id],
    queryFn: () => makeRequest.get(`/friends/${currentUser?.user_id}`).then((res) => res.data),
    enabled: !!currentUser?.user_id, // ดึงก็ต่อเมื่อมี currentUser
  });

  const relationship = friendsList?.find((friend) => friend.user_id == id);
  const isFriend = !!relationship;

  const addMutation = useMutation({
    mutationFn: () => {
      // แก้ไขจาก receiver_id: userId เป็น id (อิงจาก useParams)
      return makeRequest.post(`/friends/addfriend`, { receiver_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["friendships", currentUser?.user_id]);
      queryClient.invalidateQueries(["user", id]);
    },
    onError: (err) => {
      console.error(err);
      setError("Failed to send friend request");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      return makeRequest.delete("/friends/declinefriend", {
        data: { targetId: id }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["friendships", currentUser?.user_id]);
      queryClient.invalidateQueries(["user", id]);
    },
    onError: (err) => {
      console.error(err);
      setError("Failed to process request");
    }
  });

  const renderFriendButton = () => {
    if (isOwner) return null; // ถ้าเป็นหน้าโปรไฟล์ตัวเอง ไม่ต้องแสดงปุ่ม

    // กรณีที่ 1: ยังไม่มีความสัมพันธ์ใดๆ
    if (!isFriend) {
      return (
        <div className="actions">
          <button
            className="followBtn"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isLoading}
            style={{ backgroundColor: "#5271ff", cursor: addMutation.isLoading ? "not-allowed" : "pointer" }}
          >
            Add Friend
          </button>
        </div>
      );
    }

    // กรณีที่ 2: สถานะ Pending และ "เรา" เป็นคนส่งคำขอไป
    if (relationship.status === 'pending' && relationship.receiver_id != currentUser.user_id) {
      return (
        <div className="actions">
          <button
            className="followBtn"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isLoading}
            style={{ backgroundColor: "#ccc", color: "black", cursor: cancelMutation.isLoading ? "not-allowed" : "pointer" }}
          >
            Cancel Request
          </button>
        </div>
      );
    }

    // กรณีที่ 3: สถานะ Pending และ "เรา" เป็นคนรับคำขอ (มีคนขอแอดมา)
    if (relationship.status === 'pending' && relationship.receiver_id == currentUser.user_id) {
      return (
        <div className="actions">
          <button
            className="followBtn"
            onClick={() => cancelMutation.mutate()} // สามารถใช้ API ปฏิเสธคำขอได้ถ้าต้องการแยก
            disabled={cancelMutation.isLoading}
            style={{ backgroundColor: "#ccc", color: "black", cursor: cancelMutation.isLoading ? "not-allowed" : "pointer" }}
          >
            Decline Request
          </button>
        </div>
      );
    }

    // กรณีที่ 4: สถานะ Accepted (เป็นเพื่อนกันแล้ว) - กดเพื่อ Unfriend
    if (relationship.status === 'accepted') {
      return (
        <div className="actions">
          <button
            className="followBtn"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isLoading}
            style={{ backgroundColor: "#bababa", color: "black", cursor: cancelMutation.isLoading ? "not-allowed" : "pointer" }}
          >
            Unfriend
          </button>
        </div>
      );
    }
  };

  const handleConversation = async (userData) => {
    try {
      const res = await makeRequest.post("/chats/createconversation", { user2Id: userData.user_id });

      // จัดรูปแบบ Object ให้ตรงกับที่ระบบแชทต้องการ
      const chatData = {
        conversation_id: res.data.conversation_id,
        partner_id: userData.user_id,
        username: userData.username,
        name: userData.name,
        profilePic: userData.profilePic,
      };

      queryClient.invalidateQueries(["rightBar", currentUser?.user_id]);

      // ส่งข้อมูล state ไปกับ navigate
      navigate(`/boxchat/${currentUser?.user_id}`, { state: { selectedChat: chatData } });
    } catch (err) {
      console.log(err);
    }
  };

  const MAX_LENGTH = 15;
  const desc = userData?.description || "";
  const shortDesc =
    desc.length > MAX_LENGTH
      ? desc.slice(0, MAX_LENGTH) + "..."
      : desc;

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal]);

  const displayName = userData?.name || userData?.username || "Guest";
  const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

  return (
    <div className="profileDetail">
      <div className="container">
        <div className="cover">
          <img
            src={userData?.coverPic || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">
          <div className="profileImg">
            <img
              src={userData?.profilePic || defaultPic}
              alt="profile"
            />
          </div>
          <div className="profileInfo">
            <div className="nameRow">
              <h1 className="h1 custom-tooltip" data-tip={displayName}>
                {truncatedName}
              </h1>

              {/* {isOwner && (
                <div className="actions">
                  <button className="followBtn" onClick={() => navigate(`/editprofile/${userData?.user_id}`)} style={{ cursor: "pointer" }}>Edit Profile</button>
                </div>
              )}

              {!isOwner && (
                <div className="actions">
                  <button
                    className="followBtn"
                    onClick={handleFollow}
                    style={{
                      backgroundColor: isFollowing ? "#bababa" : "#5271ff",
                      cursor: "pointer"
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              )}
  
              {!isOwner && (
                <div className="actions">
                  <button className="followBtn" onClick={() => handleConversation(userData)} style={{ cursor: "pointer" }}>Message</button>
                </div>
              )} */}

              {isOwner ? (
                <div className="actions">
                  <button className="followBtn" onClick={() => navigate(`/editprofile/${userData?.user_id}`)} style={{ cursor: "pointer" }}>Edit Profile</button>
                </div>
              ) : (
                <>
                  {renderFriendButton()}
                  <div className="actions">
                    <button className="followBtn" onClick={() => handleConversation(userData)} style={{ cursor: "pointer" }}>Message</button>
                  </div>
                </>
              )}

            </div>
            <span className="handle">@{userData?.username}</span>
            <span className="handle">
              {shortDesc}
              <span
                style={{ cursor: "pointer", marginLeft: "5px" }}
                onClick={() => setOpenModal(true)}
              >
                ...more
              </span>
            </span>
          </div>
        </div>

        {error && <div style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</div>}

        <div className="tabs">
          <NavLink to={`/profile/${id}`} end>Posts</NavLink>
          <NavLink to={`/profile/${id}/items`}>Models</NavLink>
          <NavLink to={`/profile/${id}/projects`}>Projects</NavLink>

          {isOwner && (
            <button onClick={() => navigate(`/profile/${id}/projects/addproject`)} style={{ cursor: "pointer" }}>
              Create Project
            </button>
          )}

        </div>
        <hr />
        {openModal && (
          <div className="profileModal">
            <div className="modalContainer">
              <div className="modalHeader">
                <h2>User Info</h2>
                <CloseIcon onClick={() => setOpenModal(false)} />
              </div>
              <p><strong>Name:</strong> {userData?.name}</p>
              <p><strong>Description:</strong> {userData?.description}</p>
              <p><strong>City:</strong> {userData?.city || "-"}</p>
              <p>
                <strong>Website:</strong>{" "}
                {userData?.website ? (
                  <a href={userData.website} target="_blank">
                    {userData.website}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetail;
