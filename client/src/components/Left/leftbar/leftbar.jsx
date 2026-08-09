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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [showAll, setShowAll] = useState(false);
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

      // เอาข้อมูลมารวมกัน กรองอันที่ซ้ำออก
      const allCommu = [...createdCommu, ...joinedCommu];
      const uniqueCommunities = Array.from(
        new Map(allCommu.map((item) => [item.communities_id, item])).values()
      );

      return uniqueCommunities;
    },
    enabled: !!currentUser?.user_id, // ทำงานเมื่อมี user_id เท่านั้น
  });

  // ถ้า showAll เป็น false ให้ตัดมาแค่ 5 ตัวแรก แต่ถ้า true ให้เอามาทั้งหมด
  const displayedCommunities = showAll ? communities : communities.slice(0, 3);

  const displayName = currentUser?.name || currentUser?.username || "Guest";
  const truncatedName = displayName.length > 17 ? `${displayName.substring(0, 17)}...` : displayName;

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <img src={currentUser?.profilePic || defaultPic} alt="" />
            <p className="custom-tooltip" data-tip={displayName}>
              {truncatedName}
            </p>
          </div>
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <PeopleIcon />
            <span>Friends</span>
          </div>
          <div className="item" onClick={() => navigate(`/boxchat/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <ForumIcon />
            <span>Messenger</span>
          </div>
          <div className="item" onClick={() => navigate("/market")} style={{ cursor: "pointer" }}>
            <StorefrontIcon />
            <span>Market</span>
          </div>
          <div className="item" onClick={() => navigate(`/download/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
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

          <div className="community-list-wrapper">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              displayedCommunities.map((commu) => (
                <div
                  className="item community-item"
                  key={commu.communities_id}
                  onClick={() => navigate(`/desccommu/${commu.communities_id}`)}
                >
                  <img src={commu.cover_img || defaultPic} alt="" />
                  <span className="community-name">{commu.name.length > 20 ? `${commu.name.substring(0, 17)}...` : commu.name}</span>

                  {commu.user_id === currentUser.user_id && (
                    <MilitaryTechIcon className="owner-badge" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* 4. ปุ่ม Load More */}
          {!showAll && communities.length > 3 && (
            <div className="load-more" onClick={() => setShowAll(true)}>
              <span>See more</span>
            </div>
          )}
        </div>

        <hr />
        <div className="menu">
          <div className="menu-header"><span>Other</span></div>
          
          <div className="item" onClick={() => navigate(`/setting/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <SettingsIcon />
            <span>Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;