import "./rightbar.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const RightBar = () => {
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const { isLoading, error, data: latestItems } = useQuery({
    queryKey: ["latestItems"],
    queryFn: () => makeRequest.get("/items/latest").then((res) => res.data),
  });

  const { data: FriendRequests } = useQuery({
    queryKey: ["rightBar", currentUser?.user_id],
    queryFn: () => makeRequest.get(`/friends/${currentUser?.user_id}/requests`).then((res) => res.data),
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts", currentUser?.user_id],
    queryFn: () => makeRequest.get(`/friends/${currentUser?.user_id}/contacts`).then(res => res.data),
    
    enabled: !!currentUser?.user_id, // enabled ไม่ให้ Query ทำงานถ้ายังไม่มี User
  });

  const handleAccept = async (requesterId) => {
    try {
      await makeRequest.put("/friends/acceptfriend", { requester_id: requesterId });
      
      queryClient.invalidateQueries(["rightBar", currentUser?.user_id]); // โหลดข้อมูลใหม่หลังจากกดรับ
      queryClient.invalidateQueries(["friends"]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDecline = async (requesterId) => {
    try {
      await makeRequest.delete("/friends/declinefriend", { data: { targetId: requesterId } });
      queryClient.invalidateQueries(["rightBar", currentUser?.user_id]);
    } catch (err) {
      console.log(err);
    }
  };

  const displayedFriendRequests = showAll ? FriendRequests : FriendRequests?.slice(0, 2);

  const handleConversation = async (contact) => {
    try {
      const res = await makeRequest.post("/chats/createconversation", { user2Id: contact.user_id });

      const chatData = {
        conversation_id: res.data.conversation_id,
        partner_id: contact.user_id,
        username: contact.username,
        name: contact.name,
        profilePic: contact.profilePic,
      };

      queryClient.invalidateQueries(["rightBar", currentUser?.user_id]);

      navigate(`/boxchat/${currentUser?.user_id}`, { state: { selectedChat: chatData } });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rightBar">
      <div className="container">

        <div className="item new-releases">
          <p>New Releases</p>
          {error ? "Something went wrong" : isLoading ? "Loading..." :
            latestItems?.map((item) => (
              <div className="user" key={item.item_id} onClick={() => navigate(`/descitem/${item.item_id}`)} >
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

        <div className="item">
          <p>Friend Requests</p>
          <div className="community-list-wrapper">
            {displayedFriendRequests?.map((user) => {

              const displayName = user?.name || user?.username || "Unknown User";
              const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 8)}...` : displayName;

              return (
                <div className="user" key={user.user_id}>
                  <div className="userInfo">
                    <img
                      src={user.profilePic || defaultPic}
                      alt=""
                      onClick={() => navigate(`/profile/${user?.user_id}`)}
                      onError={(e) => { e.currentTarget.src = defaultPic; }}
                    />
                    <p>
                      <span className="custom-tooltip" data-tip={displayName} onClick={() => navigate(`/profile/${user?.user_id}`)}>
                        {truncatedName}
                      </span>
                    </p>
                  </div>
                  <div className="buttons">
                    <button className="accept" onClick={() => handleAccept(user.user_id)}>
                      Accept
                    </button>
                    <button className="decline" onClick={() => handleDecline(user.user_id)}>
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
            }
          </div>
          {!showAll && FriendRequests?.length > 2 && (
            <div className="load-more" onClick={() => setShowAll(true)} >
              <span>See more</span>
            </div>
          )}
        </div>

        <div className="item">
          <p>Contacts</p>
          {contacts?.map((contact) => {
            const displayName2 = contact?.name || contact?.username || "Unknown User";
            const truncatedName2 = displayName2.length > 15 ? `${displayName2.substring(0, 15)}...` : displayName2;
            return (
              <div className="user" key={contact.user_id} onClick={() => handleConversation(contact)} >
                <div className="userInfo">
                  <img src={contact.profilePic || defaultPic} alt="" />
                  <div className="gap-contacts" />
                  <span className="custom-tooltip" data-tip={displayName2}>
                    {truncatedName2}
                  </span>
                </div>
              </div>
            )
          })
          }
        </div>
      </div>
    </div>
  );
};

export default RightBar;