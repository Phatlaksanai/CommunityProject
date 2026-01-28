import "./profileDetail.scss";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const ProfileDetail = () => {
  const { currentUser } = useContext(AuthContext);

  const defaultPic =
    "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

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
              <h1>{currentUser?.name}</h1>
              <div className="actions">
                <button className="followBtn">จัดการโปรไฟล์</button>
              </div>
            </div>
            <span className="handle">@{currentUser?.username}</span>
          </div>
        </div>
        <div className="tabs">
          <span className="active">โพสต์</span>
          <span>โมเดล</span>
          <span>โปรเจกต์</span>
        </div>
        <hr />
      </div>
    </div>
  );
};

export default ProfileDetail;
