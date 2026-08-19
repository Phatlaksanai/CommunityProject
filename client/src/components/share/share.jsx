import "./share.scss";
import Image from "../../assets/1.png";
import Friend from "../../assets/1.png";
import AttachmentIcon from '@mui/icons-material/Attachment';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import { useQuery } from "@tanstack/react-query"; // เพิ่ม useQuery
import { backdropClasses } from "@mui/material/Backdrop";

const Share = ({ isDescCommu, commuId }) => {
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const defaultPic =
    "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [filePreviews, setFilePreviews] = useState([]);
  const [search, setSearch] = useState("");
  const [openProjectModal, setOpenProjectModal] = useState(false); // เพิ่ม State สำหรับเปิด-ปิด Modal
  const [selectedProject, setSelectedProject] = useState(null); // State สำหรับเก็บ ID โปรเจคที่เลือก

  const [error, setError] = useState("");

  // ดึงข้อมูลโปรเจคของผู้ใช้ (ตัวอย่าง API path: /projects)
  const { isLoading, data: projects } = useQuery({
    queryKey: ["userProjects", currentUser?.user_id],
    queryFn: () =>
      makeRequest.get(`/projects/addbypost/${currentUser.user_id}`).then((res) => {
        return res.data;
      }),
  });

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload/post", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts/addpost", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setDesc("");
      setFiles([]);
      setFilePreviews([]);
      setSelectedProject(null); // <--- ล้างค่า ID โปรเจกต์ที่เลือกไว้
      setSearch("");         // (Option) ล้างค่าการค้นหาใน Modal ด้วยก็ได้
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    if (desc.trim() === "" && files.length === 0 && !selectedProject) return;

    let imgUrls = [];
    let modelUrls = [];

    for (const file of files) {
      const result = await upload(file);
      if (result?.url) {
        const isModel = /\.(glb|gltf)$/i.test(file.name);
        if (isModel) {
          modelUrls.push(result.url);
        } else {
          imgUrls.push(result.url);
        }
      }
    }

    mutation.mutate({
      desc,
      img: imgUrls.length ? imgUrls : null,
      model: modelUrls.length ? modelUrls : null,
      project_id: selectedProject,
      commu_id: commuId || null,
    });
  };

  const MAX_MODEL_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      const isValidType = /\.(jpg|jpeg|png|gif|glb|gltf)$/i.test(file.name);
      if (!isValidType) return false;

      const isModel = /\.(glb|gltf)$/i.test(file.name);

      // 👉 ถ้าเป็น model ต้องไม่เกิน 10MB
      if (isModel && file.size > MAX_MODEL_SIZE) {
        setError(`File ${file.name} Over 10MB`);
        return false;
      }
      setError(""); // ล้าง error ถ้าไฟล์นี้ผ่านการตรวจสอบ
      return true;
    });
    setFiles((prev) => prev.concat(validFiles));
    e.target.value = "";
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

  const selectedProjectData = projects?.find( // หาก้อน object ที่ตรงกับ id ที่เลือกไว้
  (p) => p.project_id === selectedProject
  );

  useEffect(() => {
  if (openProjectModal) {
    document.body.style.overflow = "hidden";
  } 
  return () => {
    document.body.style.overflow = "auto";
  };
}, [openProjectModal]);

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
                  style={{ width: "50px", height: "50px", objectFit: "cover" , borderRadius: "10px"}}
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
          {selectedProject && (
            <div className="selectedProjectBadge" style={{ fontSize: "12px", color: "#ffffff", margin: "5px 0" }}>
              Project : {selectedProjectData?.project_name}
              <button
                onClick={() => setSelectedProject(null)}
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
          )}
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
                <AttachmentIcon />
                <span>Image/Model</span>
              </div>
            </label>
            {/* เพิ่ม onClick เพื่อเปิด Modal */}
            {!isDescCommu && (
              <div className="item" onClick={() => setOpenProjectModal(true)}>
                <CreateNewFolderIcon />
                <span>Project</span>
              </div>
            )}
          </div>
          {error && <p style={{ color: "red" , fontSize: "14px" }}>{error}</p>}
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>

      {/* ส่วนของ Popup (Modal) */}
      {openProjectModal && (
        <div className="projectModal">
          <div className="modalContainer">
            <h3>Select Project</h3>

            <div className="form-group">
              <label>All project</label>
              <input
                type="text"
                placeholder="ค้นหา Project"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="post-list">
                {isLoading ? (
                  "Loading..."
                ) : projects && projects.length > 0 ? (
                  projects
                    .filter((project) =>
                      project.project_name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((project) => (
                      <label key={project.project_id} className="post-item">
                        <input
                          type="radio"
                          className="custom-radio"
                          name="selectedProject"
                          checked={selectedProject === project.project_id}
                          onChange={() => setSelectedProject(project.project_id)}
                        />
                        <span>{project.project_name}</span>
                      </label>
                    ))
                ) : (
                  "No projects found"
                )}
              </div>

              {/* ปุ่มควบคุมด้านล่าง */}
              <div className="modalButtons">
                <button onClick={() => setOpenProjectModal(false)}>Cancel</button>
                <button onClick={() => setOpenProjectModal(false)} style={{backgroundColor: "#A0C46E"}}>Confirm</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Share;