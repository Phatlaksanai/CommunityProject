import "./share.scss";
import Image from "../../assets/1.png";
import Map from "../../assets/1.png";
import Friend from "../../assets/1.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Share = () => {

  const [desc, setDesc] = useState(""); // เก็บข้อความ
  const [file, setFile] = useState(null); // เก็บรูป 
  const { currentUser } = useContext(AuthContext)
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // เมื่อโพสต์สำเร็จ ให้สั่งรีเฟรชข้อมูล key "posts" ทันที
      queryClient.invalidateQueries(["posts"]);
    },
  });
  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim() === "") return; // ถ้าว่างไม่ต้องทำอะไร
    mutation.mutate({ desc, img: file }); // ส่งข้อมูลไปหลังบ้าน
    setDesc(""); // ล้างค่าในช่องกรอก
    setFile(null);
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser.profilePic} alt="" />
          <input type="text" placeholder={`What's on your mind ${currentUser.name}?`}
            onChange={(e) => setDesc(e.target.value)}
            value={desc} />
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input type="file" id="file" style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])} />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="" />
              <span>Add Place</span>
            </div>
            <div className="item">
              <img src={Friend} alt="" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
