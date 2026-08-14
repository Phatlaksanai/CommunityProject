import "./leftDP.scss";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import dayjs from "dayjs";
import ModelViewer from "../../modelViewer/model_viewer";

const LeftDP = ({ project }) => {
  const navigate = useNavigate();
  const { isLoading, error, data } = useQuery({
    queryKey: ["project-data", project],
    enabled: !!project,
    queryFn: () =>
      Promise.all([
        makeRequest.get(`/items/project/${project}`).then(res => res.data),
        makeRequest.get(`/posts/project/${project}`).then(res => res.data),
      ]).then(([items, posts]) => ({ items, posts })),
  });

  if (isLoading) return "Loading...";
  if (error) return "Something went wrong!";

  const items = data?.items ?? [];
  const posts = data?.posts ?? [];

  const hasItems = items.length > 0;
  const firstPost = posts[posts.length - 1];
  const lastPost = posts[0];

  return (
    <div className="leftDP">
      <div className="container">

        {/* ===== ITEMS ===== */}
        {hasItems &&
          items.map(item => (
            <div className="item" key={item.item_id}>
              <div className="top">
                {item.model && <ModelViewer modelUrl={item.model} />}
                {/* <img src={item.img} alt="" /> */}
                <p><strong>Name :</strong> {item.modelName}</p>
                <p><strong>Description :</strong> {item.description}</p>
                <p><strong>Price :</strong> {item.price}</p>
                <span>
                  <strong>Created At :</strong> {" "}
                  {dayjs(item.created_at)
                    .format("D MMM YYYY")}
                </span>
              </div>
              <button className="buy-button" onClick={() => navigate(`/descitem/${item.item_id}`)}>Buy</button>
            </div>
          ))}

        {/* ===== STATS (แสดงเสมอ แม้ไม่มี item) ===== */}
        <div className="item">
          <h2>Project Stats</h2>
          <p><strong>Development Duration</strong></p>

          <p>
            <strong>First Post :</strong> {" "}
            {firstPost
              ? dayjs(firstPost.created_at).format("D MMM YYYY")
              : "-"}
          </p>

          <p>
            <strong>Last Post :</strong> {" "}
            {lastPost
              ? dayjs(lastPost.created_at).format("D MMM YYYY")
              : "-"}
          </p>

          <p>
            <strong>Duration :</strong> {" "}
            {firstPost && lastPost
              ? dayjs(lastPost.created_at).diff(
                dayjs(firstPost.created_at),
                "day"
              ) + " days"
              : "-"}
          </p>

          <p>
            <strong>All Posts :</strong> {posts.length}
          </p>

        </div>

      </div>
    </div>
  );
};


export default LeftDP;
