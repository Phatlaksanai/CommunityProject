import Friend from "../friend/friend";

import "./friends.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Friends = ({ userId, isfriend }) => {
  const { isLoading, error, data = []} = useQuery({
    queryKey: ["friends", userId],
    queryFn: () => {
      return makeRequest.get(`/friends/${userId}`).then(res => res.data);
    }
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="friends">
    {data.map((user) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Friend key={user.user_id} user={user} isfriend={isfriend} />
    ))}
  </div>

};

export default Friends;
