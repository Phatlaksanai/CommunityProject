import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const RightBar = () => {

  const { isLoading, error, data: latestItems } = useQuery({
    queryKey: ["latestItems"],
    queryFn: () => makeRequest.get("/items/latest").then((res) => res.data),
  });

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item new-releases">
          <span>New Releases</span>
          {error ? (
            "Something went wrong"
          ) : isLoading ? (
            "Loading..."
          ) : (
            latestItems?.map((item) => (
              <div className="user" key={item.item_id}>
                <div className="userInfo">
                  <img
                    src={item.img} // ชื่อ column รูปภาพใน db ของคุณ
                    alt=""
                  />
                </div>
                <div className="buttons">
                  <p>{item.modelName}</p> {/* ชื่อไอเทม */}
                  <span>{item.description}</span> {/* คำอธิบายสั้นๆ */}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="item">
          <span>Friend Requests</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <p>
                <span>Nino</span>
              </p>
            </div>
            <div className="buttons">
              <button>Accept</button>
              <button>Decline</button>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <p>
                <span>Nino</span>
              </p>
            </div>
            <div className="buttons">
              <button>Accept</button>
              <button>Decline</button>
            </div>
          </div>
        </div>
        <div className="item">
          <span>Contacts</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
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