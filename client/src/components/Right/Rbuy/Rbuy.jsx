import "./Rbuy.scss";
import CloseIcon from '@mui/icons-material/Close';
import Friends from "../../../assets/1.png";
import Groups from "../../../assets/1.png";
import { useNavigate } from "react-router-dom";

const Rbuy = () => {
  const navigate = useNavigate();

  return (
    <div className="Rbuy">
          <div className="item">
            <img src={Friends} alt="" />
            <div className="info">
              <span>Friends</span> <span>฿ 200.00</span>
            </div>
          </div>
          <div className="item">
            <img src={Groups} alt="" />
            <div className="info">
              <span>Groups</span> <span>฿ 20.00</span>
            </div>
          </div>
        </div>
  );
};

export default Rbuy;
