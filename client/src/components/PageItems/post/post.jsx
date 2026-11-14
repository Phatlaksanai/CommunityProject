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
import { ClipLoader } from "react-spinners";
import ReportModal from "../../report/ReportModal";

import { useNavigate } from "react-router-dom";
import Comments from "../../comments/comments";
import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [LoadingSpin, setLoadingSpin] = useState(false);

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
    if (openReport) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeImageIndex, openReport]);

  // ฟังก์ชันเลื่อนรูปซ้าย-ขวา
  const handlePrevImage = (e) => {
    e.stopPropagation(); // กันไม่ให้คลิกทะลุไปโดนพื้นหลัง (ซึ่งจะทำให้หน้าต่างรูปปิด)
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
    // ถ้า index > 0 ให้ลบ 1 แต่ถ้าอยู่ที่รูปแรกแล้วให้วนไปรูปสุดท้าย
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
    // ถ้า index ยังไม่ถึงรูปสุดท้ายให้บวก 1 แต่ถ้าถึงแล้วให้วนกลับมารูปแรก (0)
  };

  // จำนวนคอมเม้น
  const { isLoading: commentLoading, data: commentCount } = useQuery({
    queryKey: ["commentCount", post.post_id],
    queryFn: () => makeRequest.get(`/posts/comments/count/${post.post_id}`).then((res) => res.data),
  });

  // ใครกดไลค์โพสนี้แล้วบ้าง
  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.post_id],
    queryFn: () => makeRequest.get(`/posts/likes/post/${post.post_id}`).then((res) => res.data),
  });

  const queryClient = useQueryClient();

  // จัดการไลก์
  const mutation = useMutation({
    mutationFn: async (liked) => {
      setLoadingSpin(true); // เปิด Loading ห้ามผู้ใช้กดซ้ำ
      if (liked) {
        return await makeRequest.delete(`/posts/likes/post/${post.post_id}`);// ถ้าเคยไลก์แล้ว = ลบไลก์ออก
      } else {
        return await makeRequest.post("/posts/likes", { post_id: post.post_id });// ถ้ายัง = เพิ่มไลก์
      }
    },
    onSuccess: async () => {
      // ถ้ายิง API สำเร็จ สั่งให้ เคลียแคชยอดไลค์เก่า โหลดข้อมูลยอดไลก์มาแสดงใหม่ทันที
      await queryClient.invalidateQueries(["likes", post.post_id]);
      setLoadingSpin(false);
    },
    onError: () => {
      setLoadingSpin(false); 
    },
  });

  const handleLike = () => {
    if (LoadingSpin) return;
    // !! บังคับผลลัพเป็น boolean
    const isAlreadyLiked = !!data?.includes(currentUser?.user_id);  // เช็คใน arr คนที่กดไลค์มีเรารึยัง มี = 1 
    mutation.mutate(isAlreadyLiked);
  };

  // ลบโพสต์
  const deleteMutation = useMutation({
    mutationFn: (post_id) => {
      return makeRequest.post(`/posts/delete/post/${post.post_id}`);
    },
    onSuccess: () => {
      // ลบสำเร็จ ให้รีเฟรชรายการโพสต์ทั้งหมดที่โชว์ในหน้าเว็บใหม่
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(post.post_id);
  };

  dayjs.extend(relativeTime);// เปิดใช้งานปลั๊กอินจัดการเวลาให้เป็นข้อความ (เช่น 3 วันที่แล้ว)

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo" onClick={() => navigate(`/profile/${post.user_id}`)}>
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
            <button onClick={() => {
              if (!currentUser?.user_id) {
                navigate("/login");
                return;
              }
              setOpenReport(true);
            }}>
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
                modules={[Navigation, Pagination]} //Plugins ปุ่มลูกศรและจุดไข่ปลา
                spaceBetween={0} // รูปภาพจะชนกันพอดีไม่มีช่องว่าง
                slidesPerView={1} // กำหนดให้โชว์เนื้อหาบนหน้าจอทีละ 1 สไลด์
                navigation // แสดงปุ่มลูกศร ซ้าย-ขวา
                pagination={{ clickable: true }} // สั่งให้แสดงจุดไข่ปลา
              >
                {/* ส่วนของรูปภาพ */}
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

                {/* ส่วนของโมเดล 3D */}
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
            {isLoading || LoadingSpin ? (
              <ClipLoader size={16} color="#ffffff" />
            ) : data?.includes(currentUser?.user_id) ? (
              <FavoriteOutlinedIcon style={{ color: '#A0C46E' }} disabled={LoadingSpin} onClick={handleLike} />
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
            <div className="post-form">
              <img src={post.community_cover} alt="" onClick={() => navigate(`/desccommu/${post.community_id}`)}/>
              <div className="link custom-tooltip" data-tip={post.community_name}
                onClick={() => navigate(`/desccommu/${post.community_id}`)}
              >
                Shared in {post.community_name.length > 10
                  ? `${post.community_name.substring(0, 10)}...`
                  : post.community_name}
              </div>
            </div>
          )}

          {!isDescProject && post.project_name && (
            <div className="post-form">
              <div className="link custom-tooltip" data-tip={post.project_name}
                onClick={() => navigate(`/descproject/${post.project_id}`)}
              >
                Project : {post.project_name.length > 10
                  ? `${post.project_name.substring(0, 10)}...`
                  : post.project_name}
              </div>
            </div>
          )}
        </div>
        {commentOpen && <Comments postId={post.post_id} />}
      </div>

      {/* Img full screen */}
      {activeImageIndex !== null && imageList.length > 0 && createPortal(
        <div className="FullSizeImg" onClick={() => setActiveImageIndex(null)}>
          <button className="CloseBtn" onClick={() => setActiveImageIndex(null)}>
            <CloseIcon fontSize="large" />
          </button>

          {/* แสดงปุ่มนำทางเฉพาะเมื่อรูปในโพสต์มีมากกว่า 1 รูป */}
          {imageList.length > 1 && (
            <button className="Btn prev" onClick={handlePrevImage}>
              <ArrowBackIosNewIcon />
            </button>
          )}

          <div className="img-container" onClick={(e) => e.stopPropagation()}>
            <img src={imageList[activeImageIndex]} alt="Full view" />
          </div>

          {imageList.length > 1 && (
            <button className="Btn next" onClick={handleNextImage}>
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