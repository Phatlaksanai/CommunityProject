import Post from "../post/post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Posts = ({ userId }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => {
      if (userId) {
        return makeRequest.get(`/posts/user/${userId}`).then(res => res.data);
      }
      return makeRequest.get("/posts").then(res => res.data);
    }
  });

  if (isLoading) return "Loading posts...";
  if (error) return "Something went wrong!";

  return <div className="posts">
    {data.map((post) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Post post={post} key={post.post_id || post.id} />
    ))}
  </div>

};

export default Posts;
