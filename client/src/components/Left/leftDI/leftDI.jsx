import "./leftDI.scss";
import ModelViewer from "../../modelViewer/model_viewer";
import { useNavigate } from "react-router-dom";
import { useState ,useEffect } from "react";
import { makeRequest } from "../../../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const LeftDI = ({ item }) => {
  const navigate = useNavigate();
  const [itemReviews, setItemReviews] = useState([]);

  useEffect(() => {
    makeRequest.get(`/items/reviews/${item.item_id}`).then(res => setItemReviews(res.data));
  }, []);

  if (!item) return null;

  dayjs.extend(relativeTime);

  return (
    <div className="leftDI">
      <div className="container">
        <div className="item">
          {item.model && <ModelViewer modelUrl={item.model} />}
        </div>
        <div className="item">
          <h2>Description</h2>
          <span>{item.description}</span>
        </div>

        <div className="item">
          <h2>Owner</h2>
          <div className="user">
            <div className="userInfo" onClick={() => navigate(`/profile/${item.user_id}`)} style={{ cursor: "pointer" } }>
              <img
                src={item.profilePic}
                alt=""
              />
              <div className="online" />
              <span>{item.name || item.username}</span>
            </div>
          </div>
        </div>

        <div className="item">
          <h2>Review</h2>
          {itemReviews.length > 0 ? (
            itemReviews.map((review) => (
              <div key={review.review_id} className="user">
                <div className="userInfo">
                  <img
                    src={review.users.profilePic}
                    alt=""
                  />
                  <div className="online" />
                  <span>{review.users.name || review.users.username}</span>
                </div>
                <p>{review.review}</p>
                <p>Rating: {review.points} / 5</p>
                <span className="date">{dayjs(review.created_at).fromNow()}</span>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftDI;
