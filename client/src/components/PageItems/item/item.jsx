import "./item.scss";
import "dayjs/locale/th";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/authContext";
import SettingsIcon from '@mui/icons-material/Settings';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";

const Item = ({ item, isProfile, isShop }) => {

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { currentUser } = useContext(AuthContext);

  const handleAddToCart = async () => {
    if (!currentUser) {
      setError("Please log in to add items to your cart.");
      return;
    }
    if (item.user_id === currentUser.user_id) {
      setError("You cannot add your own item to the cart.");
      return;
    }
    try {
      const res = await makeRequest.post("/payments/add-to-cart", {
        item_id: item.item_id,
      });
      const data = res.data;

      if (data.success) {
        setSuccess("Add to cart success");
      } else {
        setError(data.error || "Failed to add item to cart");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
    }
  };

  useEffect(() => {
    if (!error && !success) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 1000);

    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <div className="item">
      <div className="container">
        <div className="content" onClick={() => navigate(`/descitem/${item.item_id}`)} style={{ cursor: "pointer" }}>
          <img src={item.img} alt="" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Image+Error"; }} />
        </div>
        <div className="desc">
          <p>{item.modelName}</p>
        </div>
        <div className="price">
          <p>$ {item.price}</p>
          {isShop && (<ControlPointIcon onClick={handleAddToCart} style={{ cursor: "pointer" }} />)}
          {isProfile && item.user_id === currentUser.user_id && (<SettingsIcon onClick={() => navigate(`/edititem/${item?.item_id}`)} style={{ cursor: "pointer" }} />)}
        </div>
        {error && <div className="popupError">{error}</div>}
        {success && <div className="popupSuccess">{success}</div>}
      </div>
    </div>
  );
};

export default Item;
