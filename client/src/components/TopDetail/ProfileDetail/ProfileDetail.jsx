import "./profileDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";


const ProfileDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [openModal, setOpenModal] = useState(false);
  const isOwner = currentUser?.user_id == id;

  const { isLoading, error, data: userData } = useQuery({
    queryKey: ["user", id],
    queryFn: () => makeRequest.get(`/friends/find/${id}`).then((res) => res.data),
  });

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
            <div className="nameRow custom-tooltip">
              <h1 className="h1 custom-tooltip" data-tip={displayName}>
                {truncatedName}
              </h1>

              {isOwner && (
              <div className="actions">
                <button className="followBtn" onClick={() => navigate(`/editprofile/${userData?.user_id}`)} style={{ cursor: "pointer" }}>Edit Profile</button>
              </div>
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
