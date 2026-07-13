import "./carditem.scss";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from "react-router-dom";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { makeRequest } from "../../../api/axios";
import { useQueryClient } from "@tanstack/react-query";

const CardItem = ({ card, isCart }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const handleDeleteItem = async (itemId) => {
    try {
      await makeRequest.delete(`/payments/removeitem/${itemId}`);
      queryClient.invalidateQueries({ queryKey: ["cards", id] });

    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  return (
    <div className="carditem">
      <div className="item">
        {isCart && (
          <div className="bin">
            <DeleteForeverIcon className="delete" onClick={() => handleDeleteItem(card?.cart_items_id)} />
          </div>
        )}
        <img src={card.img} alt="" />
        <div className="info">
          <span>{card.modelName}</span> <span>฿ {card.price}</span>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
