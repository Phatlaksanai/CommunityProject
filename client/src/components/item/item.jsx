import "./item.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/comments";
import { useState, useContext } from "react";
import dayjs from "dayjs"; // moment to dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // โหลด Plugin "เมื่อสักครู่"
import "dayjs/locale/th"; // โหลดภาษาไทย (ถ้าอยากได้อังกฤษไม่ต้องใส่)
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import { AuthContext } from "../../context/authContext";
import ModelViewer from "../modelViewer/model_viewer";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const { isLoading, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () => makeRequest.get("/likes?postId=" + post.id).then((res) => {
      return res.data;
    })
  });
  const queryClient = useQueryClient();

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

  return (
    <div className="item">
      <div className="container">
        <div className="content">
            <img src="https://img.soccersuck.com/images/2021/08/31/B719EC19-10C6-46F9-B206-944B4BEE7E93.jpg" alt="" />
            
        </div>
        <div className="desc">
            {/* <p>{post.description}</p> */}
            <p>ชอบ heeชอบ heeชอบ heeชอบ heeชอบ heeชอบ heeชอบ heeชอบ heeชอบ hee</p>
        </div>
        <div className="price">
            <p>$</p>
            <p>120</p>
        </div>
      </div>
    </div>
  );
};

export default Post;
