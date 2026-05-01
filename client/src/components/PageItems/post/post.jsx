import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../../comments/comments";
import { useState, useContext } from "react";
import dayjs from "dayjs"; // moment to dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // โหลด Plugin "เมื่อสักครู่"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import ModelViewer from "../../modelViewer/model_viewer";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const { isLoading: commentLoading, data: commentCount } = useQuery({
    queryKey: ["commentCount", post.post_id], // เปลี่ยน Key ให้ต่างจากตัวดึงคอมเมนต์จริง
    queryFn: () =>
      makeRequest.get(`/posts/comments/count/${post.post_id}`).then((res) => res.data),
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.post_id],
    queryFn: () => makeRequest.get(`/posts/likes/post/${post.post_id}`).then((res) => res.data), // ข้อที่ 1
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (liked) => {
      if (liked) {
        // ถ้าเคย Like แล้ว -> ส่งคำสั่ง DELETE ไปถอน Like
        return await makeRequest.delete(`/posts/likes/post/${post.post_id}`);
      } else {
        // ถ้ายังไม่เคย Like -> ส่งคำสั่ง POST ไปเพิ่ม Like
        return await makeRequest.post("/posts/likes", { post_id: post.post_id });
      }
    },
    onSuccess: () => {
      // เมื่อทำงานสำเร็จ (ถอนหรือเพิ่มสำเร็จ)
      // สั่งให้ "ป้ายชื่อ" ที่ชื่อ "likes" ของโพสต์นี้ หมดอายุ (Invalidate)
      // เพื่อให้ useQuery (ในข้อ 1) ไปดึงข้อมูลใหม่มาอัปเดตหน้าจอทันที
      queryClient.invalidateQueries(["likes", post.post_id]);
    },
  });

  const handleLike = () => {
    // ตรวจสอบว่าใน Array 'data' มี ID ของเรา (currentUser?.user_id) อยู่ไหม
    // !! แปลงค่าให้เป็น true/false เสมอ ป้องกัน error ถ้า data เป็น null
    const isAlreadyLiked = !!data?.includes(currentUser?.user_id);
    mutation.mutate(isAlreadyLiked); // ส่งสถานะปัจจุบัน (ไลก์แล้ว/ยังไม่ไลก์) เข้าไปใน mutation
  };

  const deleteMutation = useMutation({
    mutationFn: (post_id) => {
      return makeRequest.post(`/posts/delete/post/${post.post_id}`);
    },
    onSuccess: () => {
      // เมื่อลบสำเร็จ สั่งให้รายการโพสต์ทั้งหมด (posts) รีเฟรชใหม่
      // เพื่อให้โพสต์ที่ถูกลบหายไปจากหน้า Feed
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
          <div className="userInfo">
            <img src={post.profilePic || defaultPic} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.name || post.username}</span>
              </Link>
              <span className="date">{dayjs(post.created_at).fromNow()}</span>
            </div>
          </div>
          <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          {menuOpen && post.user_id === currentUser?.user_id && (
            <button onClick={handleDelete}>delete</button>
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
                {/* ส่วนของรูปภาพ */}
                {post.imgs?.map((item, index) => (
                  <SwiperSlide key={`img-${index}`}>
                    <div className="postImage">
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
          {/* {post.models?.map((item, index) => (
            <ModelViewer key={index} modelUrl={item.model} />
          ))} */}
          {/* {models.length > 0 && models.map((modelUrl, index) => (
            <div key={index} className="model-wrapper" style={{ marginTop: "20px" }}>
              <div style={{ textAlign: "right", marginTop: "5px" }}>
                <a href={modelUrl} download style={{ fontSize: "12px", color: "gray" }}>
                  Download Model
                </a>
              </div>
            </div>
          ))} */}
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
              "loading"
            ) : data?.includes(currentUser?.user_id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentLoading ? "..." : commentCount} Comments
          </div>
        </div>
        {commentOpen && <Comments postId={post.post_id} />}
      </div>
    </div>
  );
};

export default Post;
