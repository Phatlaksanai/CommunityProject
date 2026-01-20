import Post from "../item/item";
import "./items.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Items = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      makeRequest.get("/posts").then((res) => {
        return res.data;
      }),
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="items">
    {data.map((post) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Post post={post} key={post.post_id || post.id} />
    ))}
  </div>

};

export default Items;
