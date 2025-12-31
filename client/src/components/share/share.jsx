import "./share.scss";
import Image from "../../assets/1.png";
import Friend from "../../assets/1.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Share = () => {
  const [desc, setDesc] = useState(""); // เก็บข้อความ
  const [file, setFile] = useState(null); // เก็บรูป 
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [filePreview, setFilePreview] = useState(null);  //โชว์รูปตัวอย่าง

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data; // เอา data ข้างในเป็น URL ที่หลังบ้านส่งมา
    } catch (err) {
      console.log(err);
    }
  };
  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setDesc("");
      setFile(null);
      setFilePreview(null);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim() === "" && !file) return;  // ถ้าไม่มีข้อความและไม่มีรูป ก็ไม่ต้องทำอะไร
    let imgUrl = null;
    let modelUrl = null;
    if (file) {
      const url = await upload(); // ได้ URL จาก Cloudinary มา 
      if (url) {
        const isModel = /\.(obj|glb|gltf)$/i.test(file.name); // เช็คว่าเป็นไฟล์ 3D ไหม
        if (isModel) {
          modelUrl = url; // ถ้าเป็นโมเดล ให้ใส่ตัวแปรนี้
          imgUrl = null;
        } else {
          imgUrl = url;   // ถ้าเป็นรูป ให้ใส่ตัวแปรนี้
          modelUrl = null;
        }
      }
    }
    mutation.mutate({ 
      desc, 
      img: imgUrl, 
      model: modelUrl 
    }); // ส่งข้อมูลเข้า Database 
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (/\.(jpg|jpeg|png|obj|glb|gltf)$/i.test(selected.name)) { // เช็คนามสกุลไฟล์
        setFile(selected);

        if (/\.(jpg|jpeg|png)$/i.test(selected.name)) {  // สร้าง Preview 
          setFilePreview(URL.createObjectURL(selected));
        } else {
          setFilePreview(null); // ถ้าเป็นโมเดล อาจจะไม่โชว์รูปตัวอย่าง
        }

      } else {
        alert("รองรับเฉพาะไฟล์รูปภาพ (.jpg, .png) และโมเดล 3D (.obj, .glb, .gltf) เท่านั้น");
        e.target.value = null; // reset input
      }
    }
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img src={currentUser?.profilePic || defaultPic} alt="" />
          <input
            type="text"
            placeholder={`What's on your mind ?`}
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
          />
        </div>
        <div className="right">
          {file && (
            <div className="preview">
              {filePreview ? (
                <img className="file" alt="" src={filePreview} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "12px", color: "gray" }}>📦 {file.name}</span>
              )}
              <button onClick={() => { setFile(null); setFilePreview(null); }} style={{ marginLeft: "10px", color: "red", border: "none", background: "none", cursor: "pointer" }}>X</button>
            </div>
          )}
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              accept=".jpg,.png,.jpeg,.obj,.glb,.gltf"
              onChange={handleFileChange}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="Add" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <img src={Friend} alt="Friend" />
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
