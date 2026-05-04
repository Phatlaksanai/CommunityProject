import "./leftbar.scss";
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import Events from "../../../assets/1.png";
import Gaming from "../../../assets/1.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../api/axios";

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await makeRequest.get(`communities/user/${currentUser.user_id}`);
        setCommunities(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (currentUser?.user_id) {
      fetchCommunities();
    }
  }, [currentUser]);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <img src={currentUser?.profilePic || defaultPic} alt="" />
            <span>{currentUser?.name || currentUser?.username || "Guest"}</span>
          </div>
          <div className="item">
            <PeopleIcon />
            <span>Friends</span>
          </div>
          <div className="item">
            <ForumIcon />
            <span>Messenger</span>
          </div>
          <div className="item" onClick={() => navigate("/download")} style={{ cursor: "pointer" }}>
            <StorefrontIcon />
            <span>Market</span>
          </div>
          <div className="item">
            <DownloadIcon />
            <span>Download</span>
          </div>
        </div>

        <hr />
        <div className="menu">
          <div className="menu-header">
            <span>My Communities</span>
            <button onClick={() => navigate("/addcommu")} style={{ cursor: "pointer" }}>Create</button>
          </div>
          {communities.length > 0 ? (
            communities.map((commu) => (
              // <div className="item" key={commu.communities_id}>
              <div
                className="item"
                key={commu.communities_id}
                onClick={() => navigate(`/desccommu/${commu.communities_id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={commu.cover_img || Events} alt="" />
                <span>{commu.name}</span>
              </div>
            ))
          ) : (
            <span>No communities yet</span>
          )}
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