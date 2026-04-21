import "./profileDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';


const ProfileDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [openModal, setOpenModal] = useState(false);

  const MAX_LENGTH = 15;
  const desc = currentUser?.description || "";
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
  return (
    <div className="profileDetail">
      <div className="container">
        <div className="cover">
          <img
            src={currentUser?.coverPic || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">
          <div className="profileImg">
            <img
              src={currentUser?.profilePic || defaultPic}
              alt="profile"
            />
          </div>
          <div className="profileInfo">
            <div className="nameRow">
              <h1>{currentUser?.name || currentUser?.username}</h1>
              <div className="actions">
                <button className="followBtn" onClick={() => navigate(`/editprofile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>Edit Profile</button>
              </div>
            </div>
            <span className="handle">@{currentUser?.username}</span>
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
          <button onClick={() => navigate(`/profile/${id}/projects/addproject`)} style={{ cursor: "pointer" }}>Create Project</button>
        </div>
        <hr />
        {openModal && (
          <div className="profileModal">
            <div className="modalContainer">
              <div className="modalHeader">
                <h2>User Info</h2>
                <CloseIcon onClick={() => setOpenModal(false)} />
              </div>
              <p><strong>Name:</strong> {currentUser?.name}</p>
              <p><strong>Description:</strong> {currentUser?.description}</p>
              <p><strong>City:</strong> {currentUser?.city || "-"}</p>
              <p>
                <strong>Website:</strong>{" "}
                {currentUser?.website ? (
                  <a href={currentUser.website} target="_blank">
                    {currentUser.website}
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
