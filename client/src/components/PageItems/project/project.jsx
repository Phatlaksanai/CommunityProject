import "./project.scss";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SettingsIcon from '@mui/icons-material/Settings';

const Project = ({ project }) => {
  
  const navigate = useNavigate();
  return (
    <div className="project">
      <div className="container" onClick={() => navigate(`/descproject/${project.project_id}`)} style={{ cursor: "pointer" }}>
        <div className="content" >
           <img src={project.img} alt="" onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400/457EC3/FFFFFF?text=Project";
           }}/>
        </div>
        </div>
        <div className="desc">
            <h2>{project.project_name}</h2>{/* 2026-01-30T17:00:00.000Z */}
        </div>
        <div className="price">
            <p>{dayjs(project.created_at).locale("th").format("D MMM YYYY")}</p>
              <SettingsIcon onClick={() => navigate(`/editproject/${project.project_id}`)} style={{cursor: "pointer" }} />
        </div>
      </div>
  );
};

export default Project;
