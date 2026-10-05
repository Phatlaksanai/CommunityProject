import "./rightDI.scss";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import dayjs from "dayjs";
import Timeline from "../../timeline/timeline";

const RightDI = ({ item }) => {
  if (!item) return null;
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [itemReviews, setItemReviews] = useState([]);
  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false);
  const [timelineItemId, setTimelineItemId] = useState(null);

  const handleAddToDownload = async () => {
    setIsLoadingSpinner(true);

    if (!currentUser) {
      setError("Please login to add items to your cart.");
      setIsLoadingSpinner(false);
      return;
    }
    if (item.user_id === currentUser.user_id) {
      setError("You cannot add your own item to the cart.");
      setIsLoadingSpinner(false);
      return;
    }

    try {
      const res = await makeRequest.post("/payments/addToDownload", {
        item_id: item.item_id,
      });
      const data = res.data;

      if (data.success) {
        setSuccess("Add to download success");
      } else {
        setError(data.error || "Failed to add item to download");
        setIsLoadingSpinner(false);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
      setIsLoadingSpinner(false);
    }

  }

  const handleAddToCart = async () => {
    setIsLoadingSpinner(true);

    if (!currentUser) {
      setError("Please login to add items to your cart.");
      setIsLoadingSpinner(false);
      return;
    }
    if (item.user_id === currentUser.user_id) {
      setError("You cannot add your own item to the cart.");
      setIsLoadingSpinner(false);
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
        setIsLoadingSpinner(false);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
      setIsLoadingSpinner(false);
    }
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      makeRequest.get(`/items/categories`).then((res) => res.data),
  });
  useEffect(() => {
    makeRequest.get(`/items/reviews/${item.item_id}`).then(res => setItemReviews(res.data));

    if (timelineItemId) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [timelineItemId]);

  const averageRating = itemReviews.length > 0 ? (itemReviews.reduce((sum, review) => sum + Number(review.points), 0) / itemReviews.length).toFixed(1) : "No reviews yet";

  const currentCategory = categories.find( // หา category_id ที่ตรงกับ item_id โดยไม่ต้องใช้ .map 
    (category) => category.category_id === item.category_id
  );

  return (
    <div className="rightDI">
      <div className="container">
        <div className="title"><h2>Timeline</h2></div>
        <div className="timeline" onClick={() => setTimelineItemId(item.item_id)} style={{ cursor: "pointer" }}>
          <div className="img">
            <img src={item.img} alt="" />
          </div>
          <div className="version">
            <p>Version : {item.version}</p>
            {(() => {
              const displayName = item.update_summary;
              return (
                <span>
                  Description : {displayName.length > 50 ? `${displayName.substring(0, 50)}...` : displayName}
                </span>
              );
            })()}
            <p>Created at : {dayjs(item.created_at).format("D MMM YYYY")}</p>
          </div>
        </div>
        {timelineItemId && (
          <Timeline itemId={timelineItemId} onClose={() => setTimelineItemId(null)} />
        )}
      </div>
      <div className="container">
        <div className="menu">
          <h2>{item.modelName}</h2>
          {currentCategory && (
            <h4>Category: {currentCategory.type}</h4>
          )}
          <h4>Rating: {averageRating} ★ ( Count: {itemReviews.length} )</h4>
        </div>

        <hr />{/* ส่วน 2 */}
        <div className="text">
          <div className="row">
            <h3>price</h3>
            <p>{item.price === 0 ? "Free" : item.price} $</p>
          </div>
        </div>


        <hr />{/* ส่วน 3 */}
        <div className="text">
          <div className="row">
            <h3>Subtotal</h3>
            <p>{item.price === 0 ? "Free" : item.price} $</p>
          </div>
        </div>
        <div className="menu">
          <div className="buttons">
            {item.price === 0 ? (
              <button onClick={handleAddToDownload} style={{ cursor: "pointer" }} disabled={isLoadingSpinner}
              >
                {isLoadingSpinner ? (
                  <ClipLoader size={16} color="#ffffff" />
                ) : (
                  "Add to Download"
                )}
              </button>
            ) : (
              <button onClick={handleAddToCart} style={{ cursor: "pointer" }} disabled={isLoadingSpinner}
              >
                {isLoadingSpinner ? (
                  <ClipLoader size={16} color="#ffffff" />
                ) : (
                  "Add to Cart"
                )}
              </button>
            )}
          </div>
          {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
          {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
        </div>

      </div>
    </div>
  );
};

export default RightDI;
