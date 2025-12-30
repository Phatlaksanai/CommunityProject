import Post from "../post/post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const Posts = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      makeRequest.get("/posts").then((res) => {
        return res.data;
      }),
  });

  if (isLoading) return "Loading posts...";
  if (error) return "Something went wrong!";

  return <div className="posts">
    {data.map((post) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Post post={post} key={post.post_id || post.id} />
    ))}
  </div>
  // <div className="posts">
  //   {posts.map(post=>(
  //     <Post post={post} key={post.id}/>
  //   ))}
  // </div>;

};

export default Posts;
