import Post from "../post/post";
import "./addfriends.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Addfriends = ({ userId }) => {
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

  return <div className="addfriends">
    {data.map((post) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Post key={post.post_id} post={post} />
    ))}
  </div>

};

export default Addfriends;
