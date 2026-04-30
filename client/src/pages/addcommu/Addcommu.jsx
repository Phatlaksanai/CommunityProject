import "./addcommu.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";//-------------------------------------

const AddCommu = () => {
  //----------------------------------------------------------
  const navigate = useNavigate();

  // form data
  const [CommunityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState(null);

  // message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= UPLOAD FILES TO CLOUDINARY =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError("กรุณาเลือกไฟล์รูป jpg หรือ png");
      return;
    }

    setImg(file); e.target.value = "";
    setError("");
  };

  const MAX_MODEL_SIZE = 10 * 1024 * 1024;

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!/\.(glb|gltf)$/i.test(file.name)) {
      setError("กรุณาเลือกไฟล์ .glb หรือ .gltf");
      return;
    }
    if (file.size > MAX_MODEL_SIZE) {
      setError("File size must be under 10MB");
      setModel(null); // เคลียร์ของเก่า
      e.target.value = "";
      return;
    }
    setModel(file); 
    e.target.value = "";
    setError("");
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/item", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  };

  const handleAddcommu = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!img) {
      setError("กรุณาเลือกรูปและไฟล์โมเดล");
      return;
    }

    try {
      const imgURL = await uploadFile(img);

      if (!imgURL) {
        setError("อัพโหลดไฟล์ไม่สำเร็จ");
        return;
      }

      const res = await fetch("/api/communities/addcommu", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CommunityName,
          description,
          img: imgURL.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "add community failed");
        return;
      }
      setSuccess("add community success");
      navigate("/desccommu");
    } catch (err) {
      console.error(err);
      setError("เชื่อมต่อ Server ไม่ได้");
    }
  };


  return (
    <div className="addcommu">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div className="add-item__form">
        <h1 className="add-item__title">Create your own Community</h1>
        <form onSubmit={handleAddcommu}>
          <div className="form-group">
            <label htmlFor="itemName">Name</label>
            <input type="text" id="itemName" placeholder="Community Name"
              value={CommunityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="itemDetail">Description</label>
            <input type="text" id="itemDetail" placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label>Image</label>

            <label htmlFor="image" className="file-input">
              {img ? img.name : "No file selected"}
            </label>

            <input
              type="file"
              id="image"
              accept=".png,.jpg,.jpeg"
              onChange={handleImageChange}
              hidden
            />
          </div>

          <input type="submit" value="Submit" className="add-item__submit" />
        </form>
      </div>
    </div>
  );
};

export default AddCommu;
