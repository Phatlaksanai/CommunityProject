import "./rightDI.scss";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const RightDI = ({ item }) => {
  if (!item) return null;
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

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
              <button>Check Out</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default RightDI;
