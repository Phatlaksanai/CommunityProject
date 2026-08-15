import "./leftDI.scss";
import ModelViewer from "../../modelViewer/model_viewer";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ReportModal from "../../report/ReportModal";

import { useState, useContext, useEffect } from "react";
import { makeRequest } from "../../../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const LeftDI = ({ item }) => {
  const navigate = useNavigate();
  const [itemReviews, setItemReviews] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [openReport, setOpenReport] = useState(false);

  useEffect(() => {
    makeRequest.get(`/items/reviews/${item.item_id}`).then(res => setItemReviews(res.data));
  }, []);

  const { isLoading, error, data: latestItems } = useQuery({
    queryKey: ["latestItems"],
    queryFn: () => makeRequest.get("/items/latest").then((res) => res.data),
  });

  if (!item) return null;

  dayjs.extend(relativeTime);

  return (
    <div className="leftDI">
      <div className="L">
        <div className="box">
          <h2>Info : {item.modelName}</h2>
          <p>File Formats: [1]glb [0]blaen X ...</p>
          <p>Polygon Count: 9,220</p>
          <p>Textures / Materials: [1] มี [ ] ไม่มี</p>
          <p>Rigged: [1] มีกระดูก [ ] ไม่มี</p>
          <p>UV Mapped: [1] กางแล้ว [ ] ยังไม่กาง</p>
          
        </div>
        <div className="box">
          <p>New Releases</p>
          {error ? "Something went wrong" : isLoading ? "Loading..." :
            latestItems?.map((item) => (
              <div className="user" key={item.item_id} onClick={() => navigate(`/descitem/${item.item_id}`)} style={{ cursor: "pointer" }}>
                <div className="userInfo">
                  <img src={item.img} alt="" />
                </div>
                <div className="buttons">
                  <p>{item.modelName}</p>
                  <span>{item.description}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="container">
        <div className="item">
          {item.model && <ModelViewer modelUrl={item.model} />}
        </div>
        <div className="item">
          <div className="user">
            <h2>Description</h2>
            {item.user_id !== currentUser?.user_id && (
              <ReportProblemIcon style={{ cursor: "pointer" }} onClick={() => setOpenReport(true)} />
            )}
          </div>
          <span>{item.description}</span>
        </div>

        <div className="item">
          <h2>Owner</h2>
          <div className="user">
            <div className="userInfo" onClick={() => navigate(`/profile/${item.user_id}`)} style={{ cursor: "pointer" }}>
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
                  <div className="review-info" >
                    <div className="inside">
                      {(() => {
                        const displayName = review.users.name || review.users.username;
                        return (
                          <span>
                            {displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName}
                          </span>
                        );
                      })()}
                      <p className="date">{dayjs(review.created_at).fromNow()}</p>
                    </div>
                    <span className="review-text">{review.review}</span>
                  </div>
                </div>
                <p>Rating: {review.points} ★</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>
      <ReportModal
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        targetId={item.item_id}
        entityType="item"
      />
    </div>
  );
};

export default LeftDI;
