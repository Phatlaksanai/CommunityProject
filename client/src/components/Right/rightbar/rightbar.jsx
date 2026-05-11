import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data: latestItems } = useQuery({
    queryKey: ["latestItems"],
    queryFn: () => makeRequest.get("/items/latest").then((res) => res.data),
  });

  const { isLoading: isLoadingFriend, error: friendError, data: FriendRequests } = useQuery({
    queryKey: ["rightBar", currentUser?.user_id],
    queryFn: () => makeRequest.get(`/friends/${currentUser?.user_id}/requests`).then((res) => res.data),
  });

  return (
    <div className="rightBar">
      <div className="container">
        {/* Section: New Releases */}
        <div className="item new-releases">
          <span>New Releases</span>
          {error ? "Something went wrong" : isLoading ? "Loading..." : 
            latestItems?.map((item) => (
              <div className="user" key={item.item_id}>
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

        {/* Section: Friend Requests */}
        <div className="item">
          <span>Friend Requests</span>
          {friendError ? "Error loading requests" : isLoadingFriend ? "Loading..." : 
            FriendRequests?.map((user) => {
              // เนื่องจาก Backend ส่ง Array ของ User มาแล้ว ใช้ user ได้เลย
              const displayName = user?.name || user?.username || "Unknown User";
              const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

              return (
                <div className="user" key={user.user_id}>
                  <div className="userInfo">
                    <img 
                      src={user.profilePic || "https://placehold.co/400"} 
                      alt="" 
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Error"; }} 
                    />
                    <p>
                      <span className="custom-tooltip" data-tip={displayName}>
                        {truncatedName}
                      </span>
                    </p>
                  </div>
                  <div className="buttons">
                    <button className="accept">Accept</button>
                    <button className="decline">Decline</button>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Section: Contacts */}
        <div className="item">
          <span>Contacts</span>
          <div className="user">
            <div className="userInfo">
              <img src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg" alt="" />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;