import "./commuDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import BlockIcon from '@mui/icons-material/Block';

const CommuDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";


  return (
    <div className="commudetail">
      <div className="container">
        <div className="cover">
          <img
            src={currentUser?.coverPic || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">
          <div className="profileInfo">
            <div className="nameRow">
              <h1>{currentUser?.name || currentUser?.username}</h1>
              <div className="actions">
                <SettingsIcon className="settingBtn" onClick={() => navigate(`/editprofile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
                <BlockIcon className="blockBtn" />
              </div>
            </div>
            <span className="handle">{currentUser?.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuDetail;