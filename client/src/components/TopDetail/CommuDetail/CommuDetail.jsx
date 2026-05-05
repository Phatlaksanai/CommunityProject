import "./commuDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SettingsIcon from '@mui/icons-material/Settings';
import BlockIcon from '@mui/icons-material/Block';
import dayjs from "dayjs";

const CommuDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
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
            src={community?.cover_img|| defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">

          <div className="leftSide">
            <h1>{community?.name}</h1>
            <span className="handle">{community?.description}</span>
            <div className="statsRow">
              <span>{community?.totalUsers || 0} Members</span>
              <p>{dayjs(community?.created_at).format("D MMM YYYY")}</p>
            </div>
          </div>

          <div className="rightSide">
            {community?.user_id === currentUser?.user_id ? (
              <>
                <SettingsIcon 
                  className="iconBtn settingBtn" 
                  onClick={() => navigate(`/editcommu/${community?.communities_id}`)} 
                  style={{ cursor:"pointer"}}
                />
                <BlockIcon 
                  className="iconBtn blockBtn" 
                  onClick={() => navigate(`/banmember/${community?.communities_id}`)} 
                  style={{ cursor:"pointer"}}
                />
              </>
            ) : (
              <button 
                className="followBtn" 
                onClick={handleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommuDetail;