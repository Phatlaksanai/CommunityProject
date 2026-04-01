import "./profileDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';



const ProfileDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultPic ="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

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
                <button className="followBtn">จัดการโปรไฟล์</button>
              </div>
            </div>
            <span className="handle">@{currentUser?.username}</span>
          </div>
        </div>
        <div className="tabs">
          <NavLink to={`/profile/${id}`} end>Posts</NavLink>
          <NavLink to={`/profile/${id}/items`}>Models</NavLink>
          <NavLink to={`/profile/${id}/projects`}>Projects</NavLink>
          <AddShoppingCartIcon onClick={() => navigate(`/profile/${id}/projects/addproject`)} style={{ cursor: "pointer" }}/>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default ProfileDetail;
