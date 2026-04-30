import "./Rbuy.scss";
import CloseIcon from '@mui/icons-material/Close';
import Friends from "../../../assets/1.png";
import Groups from "../../../assets/1.png";
import { useNavigate } from "react-router-dom";

const Rbuy = () => {
  const navigate = useNavigate();

  return (
    <div className="Rbuy">
      <div className="container">
        <div className="menu">
          <div className="header">
            <span>Order Summary</span>
            <CloseIcon onClick={() => navigate("/download")} style={{ cursor: "pointer" }}/>
          </div>
          <br />
          <div className="item">
            <img src={Friends} alt="" />
            <div className="info">
              <span>Friends</span> <span>฿200.00</span>
            </div>
          </div>
          <div className="item">
            <img src={Groups} alt="" />
            <div className="info">
              <span>Groups</span> <span>฿20.00</span>
            </div>
          </div>
          <br />
          <div className="row">
            <span>Subtotal</span> <span>฿500.00</span>
          </div>
          <div className="row">
            <span>Platform fee (3.5%)</span> <span>฿1000.00</span>
          </div>
        </div>

        <hr />
        <div className="menu">
          <span>Total Amount</span>
          <div className="buttons">
            <button>Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rbuy;
