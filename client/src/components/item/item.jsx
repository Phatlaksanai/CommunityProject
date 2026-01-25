import "./item.scss";
import "dayjs/locale/th";
import { useNavigate } from "react-router-dom";

const Item = ({ item }) => {
  
  const navigate = useNavigate();
  return (
    <div className="item" onClick={() => navigate(`/descitem/${item.item_id}`)} style={{ cursor: "pointer" }}>
      <div className="container">
        <div className="content">
            <img src={item.img} alt="" onError={(e) => {e.currentTarget.src = "https://placehold.co/600x400?text=Image+Error";}}/>
        </div>
        <div className="desc">
            <p>{item.modelName}</p>
        </div>
        <div className="price">
            <p>$</p>
            <p>{item.price}</p>
        </div>
      </div>
    </div>
  );
};

export default Item;
