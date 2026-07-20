import "./rightDI.scss";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext ,useState ,useEffect } from "react";
import { makeRequest } from "../../../api/axios";

const RightDI = ({ item }) => {
  if (!item) return null;
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [itemReviews, setItemReviews] = useState([]);

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
        const res = await makeRequest.post("/payments/addToCart", {
          item_id: item.item_id,
        });
        const data = res.data;
  
        if (data.success) {
          setSuccess("Add to cart success");
          navigate(`/cart/${currentUser.user_id}`)
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
      makeRequest.get(`/items/reviews/${item.item_id}`).then(res => setItemReviews(res.data));
    }, []);

    const averageRating = itemReviews.length > 0 ? (itemReviews.reduce((sum, review) => sum + Number(review.points), 0) / itemReviews.length).toFixed(1) : "No reviews yet";
    
  return (
    <div className="rightDI">
      <div className="container">
        <div className="menu">
          <h2>{item.modelName}</h2>
          <h4>Category: {item.category}</h4>
          <h4>Rating: {averageRating} ★ ( Count: {itemReviews.length} )</h4>
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
            <button onClick={handleAddToCart} style={{ cursor: "pointer" }}>Add to Cart</button>
          </div>
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </div>

      </div>
    </div>
  );
};

export default RightDI;
