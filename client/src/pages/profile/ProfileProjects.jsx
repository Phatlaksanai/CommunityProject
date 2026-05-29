import { useParams } from "react-router-dom";
import Projects from "../../components/PageItems/projects/projects";

const ProfileProjects = () => {
  const { id } = useParams(); 
  return (
    <div className="profile">
      <Projects userId={id} isProfile={true}/>
    </div>
  );
};

export default ProfileProjects;
