import Project from "../project/project";
import "./projects.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Projects = ({ userId }) => {
  const { isLoading, error, data = []} = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => {
      if (userId) {
        return makeRequest.get(`/projects/user/${userId}`).then(res => res.data);
      }
      return makeRequest.get("/projects").then(res => res.data);
    }
  });

  if (isLoading) return "Loading projects...";
  if (error) return "Something went wrong!";

  return <div className="projects">
    {data.map((project) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Project project={project} key={project.project_id} />
    ))}
  </div>

};

export default Projects;
