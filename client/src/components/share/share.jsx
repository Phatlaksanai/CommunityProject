import "./share.scss";
import Image from "../../assets/1.png";
import Friend from "../../assets/1.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Share = () => {
  const [desc, setDesc] = useState(""); // เก็บข้อความ
  const [files, setFiles] = useState([]); // เก็บหลายไฟล์
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const defaultPic =
    "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [filePreviews, setFilePreviews] = useState([]); // โชว์รูปตัวอย่างหลายไฟล์

  const upload = async (file) => {
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
      setFiles([]);
      setFilePreviews([]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim() === "" && files.length === 0) return; // ถ้าไม่มีข้อความและไม่มีรูป ก็ไม่ต้องทำอะไร

    let imgUrls = [];
    let modelUrls = [];

    for (const file of files) {
      const url = await upload(file); // ได้ URL จาก Cloudinary มา
      if (url) {
        const isModel = /\.(glb|gltf)$/i.test(file.name); // เช็คว่าเป็นไฟล์ 3D ไหม
        if (isModel) {
          modelUrls.push(url);
        } else {
          imgUrls.push(url);
        }
      }
    }

    mutation.mutate({
      desc,
      img: imgUrls.length ? imgUrls : null,
      model: modelUrls.length ? modelUrls : null,
    }); // ส่งข้อมูลเข้า Database
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) =>
      /\.(jpg|jpeg|png|gif|glb|gltf)$/i.test(file.name)
    );
    setFiles((prev) => prev.concat(validFiles));e.target.value = "";

    const previews = validFiles.map((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file.name)
        ? URL.createObjectURL(file)
        : null
    );
    setFilePreviews((prev) => prev.concat(previews));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
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
          {files.map((file, i) => (
            <div className="preview" key={i}>
              {filePreviews[i] ? (
                <img
                  className="file"
                  alt=""
                  src={filePreviews[i]}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "12px", color: "gray" }}>
                  📦 {file.name}
                </span>
              )}
              <button
                onClick={() => removeFile(i)}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              multiple  
              style={{ display: "none" }}
              accept=".jpg,.png,.jpeg,.gif,.glb,.gltf"
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
