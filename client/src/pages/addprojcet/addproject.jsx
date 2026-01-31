import "./addproject.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";//-------------------------------------

const AddProject = () => {
  //----------------------------------------------------------
  const navigate = useNavigate();

  // form data
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState(null);

  // message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  //-----------------------เลือก post ที่เกี่ยวข้อง------------------------
                    const [search, setSearch] = useState("");
                    const [selectedPosts, setSelectedPosts] = useState([]);

                    const posts = [
                    { id: 1, title: "Mini Project Data Base" },
                    { id: 2, title: "PlayWright #playwright700" },
                    { id: 3, title: "ICMP #icmp700" },
  ];
  //-----------------------เลือก post ที่เกี่ยวข้อง------------------------

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

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/project", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return await res.json();
  };

  const handleAddproject = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const imgURL = await uploadFile(img);

      const res = await fetch("/api/addproject", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          description,
          img: imgURL,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "add project failed");
        return;
      }

      setSuccess("add project success");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("เชื่อมต่อ Server ไม่ได้");
    }
  };


  return (
    <div className="add-project">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div className="add-item__form">
        <h1 className="add-item__title">เพิ่มโปรเจกต์</h1>
        <form onSubmit={handleAddproject}>
          <div className="form-group">
            <label htmlFor="itemName">ชื่อโปรเจกต์</label>
            <input type="text" id="itemName" placeholder="ชื่อโปรเจกต์"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="itemDetail">รายละเอียดโปรเจกต์</label>
            <input type="text" id="itemDetail" placeholder="รายละเอียดโปรเจกต์"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label>รูปภาพ</label>

            <label htmlFor="image" className="file-input">
              {img ? img.name : "ไม่มีไฟล์ที่เลือก"}
            </label>

            <input
              type="file"
              id="image"
              accept=".png,.jpg,.jpeg"
              onChange={handleImageChange}
              hidden
            />
          </div>

            {/* //-----------------------เลือก post ที่เกี่ยวข้อง------------------------ */}
          <div className="form-group">
            <label>Post ที่เกี่ยวข้อง</label>

            {/* ช่องค้นหา */}
            <input
                type="text"
                placeholder="ค้นหา Post"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* List */}
            <div className="post-list">
                {posts
                .filter(p =>
                    p.title.toLowerCase().includes(search.toLowerCase())
                )
                .map(post => (
                    <label key={post.id} className="post-item">
                    <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => {
                        setSelectedPosts(prev =>
                            prev.includes(post.id)
                            ? prev.filter(id => id !== post.id)
                            : [...prev, post.id]
                        );
                        }}
                    />
                    {post.title}
                    </label>
                ))}
            </div>
            </div>
                {/* //-----------------------เลือก post ที่เกี่ยวข้อง------------------------ */}

          <input type="submit" value="Submit" className="add-item__submit" />
        </form>
      </div>
    </div>
  );
};

export default AddProject;
