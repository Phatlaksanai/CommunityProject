import "./commuDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import BlockIcon from '@mui/icons-material/Block';

import dayjs from "dayjs";

import ReportModal from "../../report/ReportModal";

const CommuDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [openReport, setOpenReport] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const queryClient = useQueryClient();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  // ดึงข้อมูล Community
  const { data: community } = useQuery({
    queryKey: ["community", id],
    queryFn: () => makeRequest.get(`communities/${id}`).then((res) => res.data),
  });

  // ✅ ดึงข้อมูลคนติดตาม (สมมติว่า API ตอบกลับมาเป็น Array ของ user_id คล้ายระบบ Like)
  const { data: followers } = useQuery({
    queryKey: ["commuFollowers", id],
    queryFn: () => makeRequest.get(`/communities/followers/${id}`).then((res) => res.data),
  });

  // เช็คว่า user ปัจจุบัน กดติดตามหรือยัง
  const isFollowing = !!followers?.includes(currentUser?.user_id);

  // ✅ ระบบกดติดตาม / เลิกติดตาม
  const followMutation = useMutation({
    mutationFn: (following) => {
      if (following) {
        return makeRequest.delete(`/communities/unfollow/${id}`);
      }
      return makeRequest.post("/communities/follow", { commu_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commuFollowers", id]);
      queryClient.invalidateQueries(["community", id]);
    },
  });

  const handleFollow = () => {
    followMutation.mutate(isFollowing);
  };

  return (
    <div className="commudetail">
      <div className="container">
        <div className="cover">
          <img
            src={community?.cover_img || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">

          <div className="leftSide">
            <h1 className="custom-tooltip" data-tip={community?.name}>
              {community?.name.length > 40 ? `${community?.name.substring(0, 40)}...` : community?.name}
            </h1>
            <span className="handle">{community?.description}</span>
            <div className="statsRow">
              <span>{followers?.length !== undefined ? followers.length : (community?.totalUsers || 0)} Members</span>
              <p>{dayjs(community?.created_at).format("D MMM YYYY")}</p>
            </div>
          </div>

          <div className="rightSide">
            <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: "pointer" }} />

            {menuOpen && (
              community?.user_id === currentUser?.user_id ? (
                // ส่วนของเจ้าของโพสต์ (Owner)
                <div className="moreMenu">
                  <button onClick={() => navigate(`/editcommu/${community?.communities_id}`)} style={{ cursor: "pointer" }}>
                    <SettingsIcon style={{ width: "15px", height: "15px" }} />
                    Settings
                  </button>
                  <button onClick={() => navigate(`/banmember/${community?.communities_id}`)} style={{  backgroundColor: "#C0903B", cursor: "pointer" }}>
                    <BlockIcon style={{ width: "15px", height: "15px" }} />
                    Ban Member
                  </button>
                </div>
              ) : (
                // ส่วนของคนดูทั่วไป (Visitor)
                <div className="moreMenu">
                  <button
                    className="followBtn"
                    onClick={handleFollow}
                    style={{ backgroundColor: isFollowing ? "#C0903B" : "#A0C46E", cursor: "pointer" }}
                  >
                    
                    {isFollowing ? <GroupRemoveIcon style={{ width: "15px", height: "15px" }} /> : <GroupAddIcon style={{ width: "15px", height: "15px" }} />}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>

                  <button onClick={() => setOpenReport(true)} style={{ backgroundColor: "#C0903B", cursor: "pointer" }}>
                    <ReportProblemIcon style={{ width: "15px", height: "15px" }} />
                    Report
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        targetId={community?.communities_id}
        entityType="community"
      />
    </div>
  );
};

export default CommuDetail;