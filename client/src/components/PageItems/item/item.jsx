import "./item.scss";
import "dayjs/locale/th";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import SettingsIcon from '@mui/icons-material/Settings';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useNavigate } from "react-router-dom";

const Item = ({ item, isProfile, isShop }) => {
  
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="item">
      <div className="container">
        <div className="content" onClick={() => navigate(`/descitem/${item.item_id}`)} style={{ cursor: "pointer" }}>
            <img src={item.img} alt="" onError={(e) => {e.currentTarget.src = "https://placehold.co/600x400?text=Image+Error";}}/>
        </div>
        <div className="desc">
            <p>{item.modelName}</p>
        </div>
        <div className="price">
            <p>$ {item.price}</p>
            {isShop && (<ControlPointIcon style={{ cursor: "pointer" }}/>)}
            {isProfile && item.user_id === currentUser.user_id && (<SettingsIcon onClick={() => navigate(`/edititem/${item?.item_id}`)} style={{ cursor: "pointer" }}/>)}
        </div>
      </div>
    </div>
  );
};

export default Item;
