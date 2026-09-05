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
    if (openReport) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openReport]);

  const { isLoading, error, data: relatedItems } = useQuery({
    queryKey: ["relatedItems", "category", item.category_id],
    // สมมติว่าหลังบ้านมี route หน้าตาประมาณ /items/category/:categoryId
    queryFn: () => makeRequest.get(`/items/category/${item.category_id}?limit=5`).then((res) => res.data),
    enabled: !!item.category_id,
  });

  if (!item) return null;

  dayjs.extend(relativeTime);

  const renderFormat = (formatValue, formatName) => {
    return formatValue ? ` ${formatName} ` : null;
  };

  return (
    <div className="leftDI">
      <div className="L">
        <div className="box">
          <h2>Info : {item.modelName}</h2>

          {/* อัปเดตส่วน File Formats ให้เช็คจากไฟล์ที่มีจริง */}
          <p>
            File Formats:
            {renderFormat(item.model, 'GLB')}
            {renderFormat(item.obj, 'OBJ')}
            {renderFormat(item.blend, 'BLEND')}
            {renderFormat(item.fbx, 'FBX')}
            {renderFormat(item.usdz, 'USDZ')}
            {renderFormat(item.gltf, 'GLTF')}
          </p>

          {/* อัปเดตค่า Properties */}
          <p>Polygon Count: {item.polygon_count?.toLocaleString() || 0}</p>
          <p>Textures / Materials: {item.has_textures ? "Yes" : "No"}</p>
          <p>Rigged: {item.is_rigged ? "Yes" : "No"}</p>
          <p>UV Mapped: {item.is_uv_mapped ? "Yes" : "No"}</p>

        </div>
        <div className="box">
          <h2>Related Categories</h2>
          {error ? "Something went wrong" : isLoading ? "Loading..." :
            relatedItems?.filter(related => related.item_id !== item.item_id).map((item) => (
              <div className="user" key={item.item_id} onClick={() => navigate(`/descitem/${item.item_id}`)} style={{ cursor: "pointer" }}>
                <div className="userInfo">
                  <img src={item.img} alt="" />
                </div>
                <div className="text">
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
          <div className="model">
            {item.model && <ModelViewer modelUrl={item.model} />}
          </div>
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
                    onClick={() => navigate(`/profile/${review?.user_id}`)}
                    style={{cursor: "pointer"}}
                    alt=""
                  />
                  <div className="review-info" >
                    <div className="inside">
                      {(() => {
                        const displayName = review.users.name || review.users.username;
                        return (
                          <span onClick={() => navigate(`/profile/${review?.user_id}`)} style={{cursor: "pointer"}}>
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
