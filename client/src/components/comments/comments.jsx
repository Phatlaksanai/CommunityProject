import "./comments.scss";
import PhotoIcon from '@mui/icons-material/Photo';
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import { useQuery } from "@tanstack/react-query"; // เพิ่ม useQuery
import dayjs from "dayjs"; // moment to dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // โหลด Plugin "เมื่อสักครู่"

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const queryClient = useQueryClient();

  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const { data: commentsData } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get(`/posts/comments/${postId}`).then(res => res.data)
  });
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload/comment", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts/addcomment", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", postId]);
      setDesc("");
      setFiles([]);
      setFilePreviews([]);
    },
  });
  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim() === "" && files.length === 0) return;

    let imgUrl = null;

    if (files[0]) {
      const result = await upload(files[0]);
      if (result?.url) imgUrl = result.url;
    }

    mutation.mutate({
      desc,
      img: imgUrl,
      postId: postId,
      userId: currentUser.user_id
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.(jpg|jpeg|png|gif)$/i.test(file.name)) return;
    setFiles([file]); // overwrite เลย
    const preview = URL.createObjectURL(file);
    setFilePreviews([preview]); // เหลือ 1 อัน
    e.target.value = null; // ล้างค่า input หลังเลือกไฟล์
  };

  const removeFile = () => {
    setFiles([]);
    setFilePreviews([]);
  };

  dayjs.extend(relativeTime);

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profilePic} alt="" />

        <input
          type="file"
          id={`file-${postId}`}
          style={{ display: "none" }}
          accept=".jpg,.png,.jpeg,.gif"
          onChange={handleFileChange}
        />

        <label htmlFor={`file-${postId}`} className="item">
          <PhotoIcon />
        </label>

        <div className="preview-container">
          {filePreviews[0] && (
            <div className="preview">
              {filePreviews[0] && (
                <img src={filePreviews[0]} alt="" />
              )}
              <button
                onClick={removeFile}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer"
                }}
              >
                X
              </button>
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="write a comment"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {commentsData?.map((comment) => (
        <div className="comment" key={comment.comment_id}>
          <img src={comment?.profilePic || defaultPic} alt="" />
          <div className="content">
            <div className="info">
              <div classname="top"> 
              <span>{comment.name || comment.username}</span>
              <span className="date">{dayjs(comment.created_at).fromNow()}</span>
              </div>
              <p>{comment.description}</p>
              {comment.img && (
                <img src={comment.img} alt="" />
              )}
            </div>
          </div>
        </div>
      ))}
      {commentsData?.length === 0 && (
  <p className="noComment">No Comment</p>
)}
    </div>
  );
};

export default Comments;
