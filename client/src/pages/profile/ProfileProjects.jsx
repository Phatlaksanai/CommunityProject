import { useParams } from "react-router-dom";
import Projects from "../../components/PageItems/projects/projects";
import ScrollToTop from "../../ScrollToTop";

const ProfileProjects = () => {
  const { id } = useParams(); 
  return (
    <div className="profile">
      <ScrollToTop />
      <Projects userId={id} isProfile={true}/>
    </div>
  );
};

export default ProfileProjects;
