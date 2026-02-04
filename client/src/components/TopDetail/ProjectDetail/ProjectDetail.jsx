import "./projectDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';



const ProjectDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="projectDetail">
      <div className="container">
        <div className="cover">
          <img
            src={currentUser?.coverPic || defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="projectHeader">
          <div className="projectInfo">
            <div className="nameRow">
              <h1>ProjectName</h1>
            </div>
            <span className="handle">Description of the project</span>
            <p>3/2/2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
