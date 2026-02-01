import "./project.scss";
import "dayjs/locale/th";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Project = ({ project }) => {
  
  const navigate = useNavigate();
  return (
    <div className="project" onClick={() => navigate(`/descitem/${project.project_id}`)} style={{ cursor: "pointer" }}>
      <div className="container">
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
            <p>{project.createAt}</p>
            
        </div>
      </div>
  );
};

export default Project;
