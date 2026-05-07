import Post from "../post/post";
import "./friends.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Friends = ({ userId }) => {
  const { isLoading, error, data = []} = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => {
      if (userId) {
        return makeRequest.get(`/projects/user/${userId}`).then(res => res.data);
      }
      return makeRequest.get("/projects").then(res => res.data);
    }
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="friends">
    {data.map((post) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Post key={post.post_id} post={post} />
    ))}
  </div>

};

export default Friends;
