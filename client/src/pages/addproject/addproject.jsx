import "./addproject.scss";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const AddProject = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchPost, setSearchPost] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["userPosts", currentUser.user_id],
    queryFn: () =>
      makeRequest
        .get(`/posts/user/${currentUser.user_id}/available`)
        .then((res) => res.data),
  });
  const { data: items = [] } = useQuery({
    queryKey: ["userItems", currentUser.user_id],
    queryFn: () =>
      makeRequest
        .get(`/items/user/${currentUser.user_id}/available`)
        .then((res) => res.data),
  });

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

    // ใช้ .trim() เพื่อตัดช่องว่างหน้า-หลัง และเช็คว่าชื่อว่างหรือไม่
    const trimmedProjectName = projectName.trim();

    // 1. เช็คชื่อโปรเจคที่ตัดช่องว่างออกแล้ว
    if (!trimmedProjectName) {
      setError("กรุณากรอกชื่อ Project (ห้ามเว้นว่าง)");
      return;
    }

    // 2. เพิ่มการเช็คว่าเลือก Post อย่างน้อย 1 อันหรือยัง
    if (selectedPosts.length === 0) {
      setError("กรุณาเลือกอย่างน้อย 1 โพสต์เพื่อรวมในโปรเจค");
      return;
    }

    try {
      let imgUrl = null;
      let imgPublicId = null;

      if (img) {
        const uploadRes = await uploadFile(img);
        imgUrl = uploadRes.url;
        imgPublicId = uploadRes.public_id;
      }

      const res = await fetch("/api/projects/addproject", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          description,
          imgUrl,
          imgPublicId,
          relatedPosts: selectedPosts,
          relatedItem: selectedItem,
          userId: currentUser.user_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "add project failed");
        return;
      }

      setSuccess("add project success");
      navigate(`/profile/${currentUser.user_id}/projects`);
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
        <h1 className="add-item__title">Add Project</h1>
        <form onSubmit={handleAddproject}>
          <div className="form-group">
            <label htmlFor="itemName">Project Name</label>
            <input type="text" id="itemName" placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label htmlFor="itemDetail">Project Description</label>
            <input type="text" id="itemDetail" placeholder="Project Description"
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

          <div className="form-group">
            <label>Related Posts</label>
            <input
              type="text"
              placeholder="Search Posts"
              value={searchPost}
              onChange={(e) => setSearchPost(e.target.value)}
            />
            {isLoading && <p>loading Posts...</p>}
            <div className="post-list">
              {posts
                .filter(post =>
                  post.description.toLowerCase().includes(searchPost.toLowerCase())
                )
                .map(post => (
                  <label key={post.post_id} className="post-item">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.post_id)}
                      onChange={() => {
                        setSelectedPosts(prev =>
                          prev.includes(post.post_id)
                            ? prev.filter(id => id !== post.post_id)
                            : [...prev, post.post_id]
                        );
                      }}
                    />
                    <img
                      src={post.img}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/457EC3/FFFFFF?text=Project"
                      }}
                    />
                    <span>{post.description}</span>
                  </label>
                ))}
            </div>
          </div>
          <div className="form-group">
            <label>Related Items</label>
            <input
              type="text"
              placeholder="Search Items"
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
            />
            <div className="post-list">
              {items
                .filter((item) =>
                  item.modelName.toLowerCase().includes(searchItem.toLowerCase())
                )
                .map((item) => (
                  <label key={item.item_id} className="post-item">
                    <input
                      type="radio"
                      name="selectedItem"
                      checked={selectedItem === item.item_id}
                      onChange={() => setSelectedItem(item.item_id)}
                    />
                    <img
                      src={item.img}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x400/457EC3/FFFFFF?text=Item";
                      }}
                    />
                    <span>{item.modelName}</span>
                  </label>
                ))}
            </div>
          </div>

          <input type="submit" value="Submit" className="add-item__submit" />
        </form>
      </div>
    </div>
  );
};

export default AddProject;
