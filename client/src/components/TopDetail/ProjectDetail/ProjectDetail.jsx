import "./projectDetail.scss";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import img from "../../../assets/DefaultProject.jpg";
import dayjs from "dayjs";

const ProjectDetail = () => {
  const { id } = useParams();
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
  const displayName = Project?.project_name || "Project Name";
  const truncatedName = displayName.length > 40 ? `${displayName.substring(0, 40)}...` : displayName;

  return (
    <div className="projectDetail">
      <div className="container">
        <div
          className="cover"
          style={{ "--cover-image": `url(${Project?.img || img})` }}
        >
          <img
            src={Project?.img || img}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="projectHeader">
          <div className="projectInfo">
            <div className="nameRow">
              <h1 className="h1 custom-tooltip" data-tip={displayName}>
                {truncatedName}
              </h1>
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
