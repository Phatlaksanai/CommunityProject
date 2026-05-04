import './editProject.scss';
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const EditProject = () => {
  const navigate = useNavigate();
  const { id: project_id } = useParams();
  const { currentUser } = useContext(AuthContext);

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imgPublicId, setImgPublicId] = useState(null);

  // ดึงข้อมูล Posts
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["editProjectPosts", project_id],
    queryFn: () => makeRequest.get(`/posts/project-edit/${project_id}`).then(res => res.data),
  });

  // ดึงข้อมูล Items
  const { data: items = [], isLoading: isItemsLoading } = useQuery({
    queryKey: ["editProjectItems", project_id],
    queryFn: () => makeRequest.get(`/items/project-edit/${project_id}`).then(res => res.data),
  });

  const { data: projects } = useQuery({
    queryKey: ["project", project_id],
    queryFn: () =>
      makeRequest.get(`/projects/${project_id}`).then(res => res.data),
  });

  // ✅ 1. ย้าย useEffect มาไว้ข้างนอก (Top Level)
  useEffect(() => {
    if (posts.length > 0) {
      const initialSelected = posts
        .filter(post => post.project_id === Number(project_id))
        .map(post => post.post_id);
      setSelectedPosts(initialSelected);
    }
    if (items.length > 0) {
      const initialItem = items.find(item => item.project_id === Number(project_id));
      if (initialItem) setSelectedItem(initialItem.item_id);
    }
    if (projects) {
      setProjectName(projects.project_name);
      setDescription(projects.description);
      setImg(projects.img);
      setImgPublicId(projects.img_public_id);
    }
  }, [posts, items, projects]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError("Please select a JPG or PNG file");
      return;
    }
    setImg(file);
    setError("");
  };

  // const uploadFile = async (file) => {
  //   if (!file) return null;
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   // ปรับ URL ให้ตรงกับ API ของคุณ (เช่น /upload)
  //   const res = await makeRequest.post("/upload/project", formData); 
  //   return res.data; // สมมติว่าคืนค่าเป็นชื่อไฟล์หรือ URL
  // };

  // ✅ 2. รวมฟังก์ชัน Submit สำหรับการ Update
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ใช้ .trim() เพื่อตัดช่องว่างหน้า-หลัง และเช็คว่าชื่อว่างหรือไม่
    const trimmedProjectName = projectName.trim();

    // เช็คชื่อโปรเจคที่ตัดช่องว่างออกแล้ว
    if (!trimmedProjectName) {
      setError("Please enter a Project Name (cannot be empty)");
      return;
    }

    // เพิ่มการเช็คว่าเลือก Post อย่างน้อย 1 อันหรือยัง
    if (selectedPosts.length === 0) {
      setError("Please select at least one related Post");
      return;
    }

    try {
      let imgUrl = img; // ค่าเดิม
      let newimgPublicId = imgPublicId;  // สำหรับเก็บ public_id ของรูปที่อัปโหลดใหม่ (ถ้ามี)

      // ถ้ามีการเลือกไฟล์ใหม่ (เป็น Object File)
      if (img && typeof img !== 'string') {
        const formData = new FormData();
        formData.append("file", img);

        // ตรวจสอบ Path นี้ที่ Backend ดีๆ ว่าเป็น /upload หรือ /upload/project
        const res = await makeRequest.post("/upload/project", formData);
        imgUrl = res.data.url;
        newimgPublicId = res.data.public_id;
      }

      await makeRequest.put("/projects/update", {
        projectId: project_id,
        projectName,
        description,
        img: imgUrl,
        relatedPosts: selectedPosts,
        relatedItem: selectedItem,
        imgPublicId: newimgPublicId,
      });

      setSuccess("Update successful!");
      navigate(`/profile/${currentUser.user_id}/projects`);
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  if (isPostsLoading || isItemsLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="editProject">
      <div className="add-item__form">
        <h1 className="add-item__title">Edit Project</h1>
        {/* ✅ เรียกใช้ handleUpdateProject */}
        <form onSubmit={handleUpdateProject}>
          <div className="form-group">
            <label htmlFor="itemName">Project Name</label>
            <input type="text" id="itemName" value={projectName}
              onChange={(e) => setProjectName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="itemDetail">Project Description</label>
            <input type="text" id="itemDetail" value={description}
              onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Image</label>
            <label htmlFor="image" className="file-input">
              {img instanceof File ? img.name : "Click to change image"}
            </label>
            <input type="file" id="image" accept=".png,.jpg,.jpeg" onChange={handleImageChange} hidden />
          </div>

          {/* ส่วนของ Posts */}
          <div className="form-group">
            <label>Related Posts</label>
            <input type="text" placeholder="Search Posts" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="post-list">
              {posts
                .filter(post => post.description.toLowerCase().includes(search.toLowerCase()))
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
                    <img src={post.img} alt="" onError={(e) => e.currentTarget.src = "https://placehold.co/100"} />
                    <span>{post.description}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* ส่วนของ Items */}
          <div className="form-group">
            <label>Related Items</label>
            <div className="post-list">
              {items
                .filter(item => item.modelName.toLowerCase().includes(search.toLowerCase()))
                .map(item => (
                  <label key={item.item_id} className="post-item">
                    <input
                      type="radio"
                      name="selectedItem"
                      checked={selectedItem === item.item_id}
                      onChange={() => setSelectedItem(item.item_id)}
                    />
                    <img src={item.img} alt="" onError={(e) => e.currentTarget.src = "https://placehold.co/100"} />
                    <span>{item.modelName}</span>
                  </label>
                ))}
            </div>
          </div>

          <input type="submit" value="Save Changes" className="add-item__submit" />
          {error && <span style={{ color: "red" , margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green" , margin: "0px 10px" }}>{success}</span>}
        </form>
      </div>
    </div>
  );
};

export default EditProject;