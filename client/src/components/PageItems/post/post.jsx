import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../../comments/comments";
import { useState, useContext } from "react";
import dayjs from "dayjs"; // moment to dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // โหลด Plugin "เมื่อสักครู่"
import "dayjs/locale/th"; // โหลดภาษาไทย (ถ้าอยากได้อังกฤษไม่ต้องใส่)
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

  // const { isLoading, error, data } = useQuery(["likes", post.id], () =>
  //   makeRequest.get("/likes?postId=" + post.id).then((res) => {
  //     return res.data;
  //   })
  // );
  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => makeRequest.get("/likes?postId=" + post.id).then((res) => {
      return res.data;
    })
  });
  const queryClient = useQueryClient();

  // const mutation = useMutation(
  //   (liked) => {
  //     if (liked) return makeRequest.delete("/likes?postId=" + post.id);
  //     return makeRequest.post("/likes", { postId: post.id });
  //   },
  //   {
  //     onSuccess: () => {
  //       // Invalidate and refetch
  //       queryClient.invalidateQueries(["likes"]);
  //     },
  //   }
  // );
  // const deleteMutation = useMutation(
  //   (postId) => {
  //     return makeRequest.delete("/posts/" + postId);
  //   },
  //   {
  //     onSuccess: () => {
  //       // Invalidate and refetch
  //       queryClient.invalidateQueries(["posts"]);
  //     },
  //   }
  // );
  const mutation = useMutation({
    mutationFn: (liked) => {
      if (liked) return makeRequest.delete("/likes?postId=" + post.id);
      return makeRequest.post("/likes", { postId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };

  dayjs.extend(relativeTime);
  dayjs.locale("th");

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
          {menuOpen && post.userId === currentUser.id && (
            <button onClick={handleDelete}>delete</button>
          )}
        </div>
        <div className="content">
          <p>{post.description}</p>

          {(post.imgs?.length > 0) && (
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
            ) : data?.includes(currentUser.id) ? (
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
            See Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
