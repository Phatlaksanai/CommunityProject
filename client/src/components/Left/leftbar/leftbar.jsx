import "./leftbar.scss";
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["leftBarCommunities", currentUser?.user_id],
    queryFn: async () => {
      // ดึงข้อมูล 2 เส้นพร้อมกัน
      const [createdRes, joinedRes] = await Promise.all([
        makeRequest.get(`communities/user/${currentUser.user_id}`),
        makeRequest.get(`communities/joined/${currentUser.user_id}`)
      ]);

      const createdCommu = createdRes.data || [];
      const joinedCommu = joinedRes.data || [];

      // จับมารวมกันแล้วส่งคืนค่าได้เลย
      return [...createdCommu, ...joinedCommu];
    },
    enabled: !!currentUser?.user_id, // ทำงานเมื่อมี user_id เท่านั้น
  });

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
          {isLoading ? (
            <span style={{ fontSize: "12px", color: "gray" }}>Loading communities...</span>
          ) : communities.length > 0 ? (
            communities.map((commu) => (
              <div
                className="item"
                key={commu.communities_id}
                onClick={() => navigate(`/desccommu/${commu.communities_id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={commu.cover_img} alt="" />
                <span>{commu.name}</span>
                
                {commu.user_id === currentUser.user_id && (
                  <MilitaryTechIcon style={{ marginLeft: "auto", color: "gray"}} />
                )}
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