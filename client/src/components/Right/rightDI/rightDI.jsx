import "./rightDI.scss";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";

const RightDI = ({ item }) => {
  if (!item) return null;
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="rightDI">
      <div className="container">
        <div className="menu">
          <h2>{item.modelName}</h2>
          <h4>Taxes</h4>
          <h4>5 ★ ★ ★ ★ ★ (1)</h4>

        </div>

        <hr />{/* ส่วน 2 */}
        <div className="text">
          <div className="row">
            <h3>price</h3>
            <p>{item.price} $</p>
          </div>

          <div className="row">
            <h3>Sale discount</h3>
            <p>None</p>
          </div>
        </div>


        <hr />{/* ส่วน 3 */}
        <div className="text">
          <div className="row">
            <h3>Subtotal</h3>
            <p>{item.price} $</p>
          </div>
        </div>
        <div className="menu">
          <div className="buttons">
              <button onClick={() => navigate(`/buyitem/${currentUser.user_id}`)} style={{ cursor: "pointer" }}>Check Out</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default RightDI;
