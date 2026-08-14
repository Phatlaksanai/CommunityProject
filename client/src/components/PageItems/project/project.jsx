import "./project.scss";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import img from "../../../assets/DefaultProject.jpg";

const Project = ({ project, isProfile }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="project">
      <div className="container" onClick={() => navigate(`/descproject/${project.project_id}`)} style={{ cursor: "pointer" }}>
        <div className="content" >
          <img src={project.img || img} alt="" />
        </div>
      </div>
      <div className="desc">
        <h3 className="h3 custom-tooltip" data-tip={project.project_name}>
          {project.project_name.length > 20 ? `${project.project_name.substring(0, 10)}...` : project.project_name}
        </h3>
      </div>
      <div className="price">
        <p>{dayjs(project.created_at).format("D MMM YYYY")}</p>
        {isProfile && project.user_id === currentUser.user_id && (
          <SettingsIcon onClick={() => navigate(`/editproject/${project.project_id}`)} style={{ cursor: "pointer" , color: "#A0C46E"}} />
        )}
      </div>
    </div>
  );
};

export default Project;
