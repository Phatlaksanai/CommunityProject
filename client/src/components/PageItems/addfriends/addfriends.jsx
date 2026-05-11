import Friend from "../friend/friend";

import "./addfriends.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Friends = ({ userId }) => {
  const { isLoading, error, data = []} = useQuery({
    queryKey: ["addfriends", userId],
    queryFn: () => {
        return makeRequest.get(`/friends/add/friend`).then(res => res.data);
    }
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="addfriends">
    {data.map((user) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Friend key={user.user_id} user={user} />
    ))}
  </div>

};

export default Friends;
