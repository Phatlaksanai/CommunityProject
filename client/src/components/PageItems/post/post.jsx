import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteIcon from '@mui/icons-material/Delete';

import ReportModal from "../../report/ReportModal";

import { Link, useNavigate } from "react-router-dom";
import Comments from "../../comments/comments";
import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom"; // นำเข้า Portal สำหรับทำ Lightbox
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import ModelViewer from "../../modelViewer/model_viewer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Post = ({ post, isDescCommu, isDescProject }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [openReport, setOpenReport] = useState(false);

  // --- [เพิ่มสเตตัสสำหรับ Lightbox] ---
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  
  // สร้าง Array สำหรับเก็บเฉพาะ URL ของรูปภาพ เพื่อเอาไว้ใช้ไล่ลำดับใน Lightbox
  const imageList = post.imgs?.map((item) => item.img) || [];

  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  // ล็อกการสกรอลล์หน้าจอเมื่อเปิด Lightbox
  useEffect(() => {
    if (activeImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeImageIndex]);

  // ฟังก์ชันเลื่อนรูปซ้าย-ขวาใน Lightbox
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  const { isLoading: commentLoading, data: commentCount } = useQuery({
    queryKey: ["commentCount", post.post_id],
    queryFn: () => makeRequest.get(`/posts/comments/count/${post.post_id}`).then((res) => res.data),
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.post_id],
    queryFn: () => makeRequest.get(`/posts/likes/post/${post.post_id}`).then((res) => res.data),
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (liked) => {
      if (liked) {
        return await makeRequest.delete(`/posts/likes/post/${post.post_id}`);
      } else {
        return await makeRequest.post("/posts/likes", { post_id: post.post_id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likes", post.post_id]);
    },
  });

  const handleLike = () => {
    const isAlreadyLiked = !!data?.includes(currentUser?.user_id);
    mutation.mutate(isAlreadyLiked);
  };

  const deleteMutation = useMutation({
    mutationFn: (post_id) => {
      return makeRequest.post(`/posts/delete/post/${post.post_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(post.post_id);
  };

  dayjs.extend(relativeTime);

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo" onClick={() => navigate(`/profile/${post.user_id}`)} style={{ cursor: "pointer" }}>
            <img src={post.profilePic || defaultPic} alt="" />
            <div className="details">
              <span className="name">{post.name || post.username}</span>
              <span className="date">{dayjs(post.created_at).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.user_id === currentUser?.user_id && (
            <button onClick={handleDelete}>
              <DeleteIcon />
              Delete
            </button>
          )}
          {menuOpen && post.user_id !== currentUser?.user_id && (
            <button onClick={() => setOpenReport(true)}>
              <ReportProblemIcon style={{ width: "15px", height: "15px" }} />
              Report
            </button>
          )}
        </div>
        
        <div className="content">
          <p>{post.description}</p>

          {((post.imgs?.length > 0) || (post.models?.length > 0)) && (
            <div className="postMediaSlider">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="mySwiper"
              >
                {/* ส่วนของรูปภาพ (ผูก Event onClick เพื่อเปิด Lightbox) */}
                {post.imgs?.map((item, index) => (
                  <SwiperSlide key={`img-${index}`}>
                    <div 
                      className="postImage" 
                      onClick={() => setActiveImageIndex(index)} 
                      style={{ cursor: "pointer" }}
                    >
                      <img src={item.img} alt="" />
                    </div>
                  </SwiperSlide>
                ))}

                {/* ส่วนของโมเดล 3D (แยกทำงานอิสระตามเดิม ไม่โดนแทรกแซง) */}
                {post.models?.map((item, index) => (
                  <SwiperSlide key={`model-${index}`}>
                    <div className="postModel">
                      <ModelViewer modelUrl={item.model} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : data?.includes(currentUser?.user_id) ? (
              <FavoriteOutlinedIcon style={{ color: '#A0C46E' }} onClick={handleLike} />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentLoading ? "..." : commentCount} Comments
          </div>
          {!isDescCommu && post.community_name && (
            <div className="postCommunityInfo">
              <img src={post.community_cover} alt="" onClick={() => navigate(`/desccommu/${post.community_id}`)} style={{ cursor: "pointer" }} />
              <Link
                className="community-link custom-tooltip"
                data-tip={post.community_name}
                to={`/desccommu/${post.community_id}`}
              >
                Shared in {post.community_name.length > 10
                  ? `${post.community_name.substring(0, 10)}...`
                  : post.community_name}
              </Link>
            </div>
          )}

          {!isDescProject && post.project_name && (
            <div className="postCommunityInfo">
              <Link
                className="community-link custom-tooltip"
                data-tip={post.project_name}
                to={`/descproject/${post.project_id}`}
              >
                Project : {post.project_name.length > 10
                  ? `${post.project_name.substring(0, 10)}...`
                  : post.project_name}
              </Link>
            </div>
          )}
        </div>
        {commentOpen && <Comments postId={post.post_id} />}
      </div>

      {/* Img full screen */}
      {activeImageIndex !== null && imageList.length > 0 && createPortal(
        <div className="lightboxOverlay" onClick={() => setActiveImageIndex(null)}>
          <button className="lightboxCloseBtn" onClick={() => setActiveImageIndex(null)}>
            <CloseIcon fontSize="large" />
          </button>

          {/* แสดงปุ่มนำทางเฉพาะเมื่อรูปในโพสต์มีมากกว่า 1 รูป */}
          {imageList.length > 1 && (
            <button className="navBtn prev" onClick={handlePrevImage}>
              <ArrowBackIosNewIcon />
            </button>
          )}

          <div className="lightboxContent" onClick={(e) => e.stopPropagation()}>
            <img src={imageList[activeImageIndex]} alt="Full view" />
          </div>

          {imageList.length > 1 && (
            <button className="navBtn next" onClick={handleNextImage}>
              <ArrowForwardIosIcon />
            </button>
          )}

          <div className="imageCounter">
            {activeImageIndex + 1} / {imageList.length}
          </div>
        </div>,
        document.body
      )}
      <ReportModal
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        targetId={post.post_id}
        entityType="post"
      />
    </div>
  );
};

export default Post;