import "./leftbar.scss";
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import Events from "../../../assets/1.png";
import Gaming from "../../../assets/1.png";
import Gallery from "../../../assets/1.png";
import Videos from "../../../assets/1.png";
import Messages from "../../../assets/1.png"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <img src={currentUser?.profilePic || defaultPic} alt="" />
            <span>{currentUser?.name || currentUser?.username || "Guest"}</span>
          </div>
          <div className="item">
            <PeopleIcon/>
            <span>Friends</span>
          </div>
          <div className="item">
            <ForumIcon/>
            <span>Messenger</span>
          </div>
          <div className="item" onClick={() => navigate("/download")} style={{ cursor: "pointer" }}>
            <StorefrontIcon/>
            <span>Market</span>
          </div>
          <div className="item">
            <DownloadIcon/>
            <span>Download</span>
          </div>
        </div>

        <hr />
        <div className="menu">
          <div className="menu-header">
            <span>My Communities</span>
            <button>Create</button>
          </div>
          <div className="item">
            <img src={Events} alt="" />
            <span>Events</span>
          </div>
          <div className="item">
            <img src={Gaming} alt="" />
            <span>Gaming</span>
          </div>
          <div className="item">
            <img src={Gallery} alt="" />
            <span>Gallery</span>
          </div>
          <div className="item">
            <img src={Videos} alt="" />
            <span>Videos</span>
          </div>
          <div className="item">
            <img src={Messages} alt="" />
            <span>Messages</span>
          </div>
        </div>

        <hr />
        <div className="menu">
          <span>Other</span>
          <div className="item">
            <SettingsIcon />
            <span>Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;