import "./carditem.scss";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";

const CardItem = ({ card }) => {
  const navigate = useNavigate();

  return (
    <div className="carditem">
          <div className="item">
            <img src={card.img} alt="" />
            <div className="info">
              <span>{card.modelName}</span> <span>฿ {card.price}</span>
            </div>
          </div>
        </div>
  );
};

export default CardItem;
