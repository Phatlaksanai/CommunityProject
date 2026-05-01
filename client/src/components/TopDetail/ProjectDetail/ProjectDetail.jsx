import "./projectDetail.scss";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import dayjs from "dayjs";

const ProjectDetail = () => {
  const { id } = useParams();
  const defaultPic = "https://placehold.co/600x400/457EC3/FFFFFF?text=Project";
  const [Project, setProject] = useState(null);
  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const res = await makeRequest.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="projectDetail">
      <div className="container">
        <div
          className="cover"
          style={{ "--cover-image": `url(${Project?.img || defaultPic})` }}
        >
          <img
            src={Project?.img || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="projectHeader">
          <div className="projectInfo">
            <div className="nameRow">
              <h1>{Project?.project_name || "Project Name"}</h1>
            </div>
            <span className="handle">{Project?.description}</span>
            <p>{dayjs(Project?.createAt).format("D MMM YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
