import Project from "../project/project";
import "./projects.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Projects = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      makeRequest.get("/projects").then((res) => {
        return res.data;
      }),
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
