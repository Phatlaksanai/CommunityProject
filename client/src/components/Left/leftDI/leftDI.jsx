import "./leftDI.scss";
import ModelViewer from "../../modelViewer/model_viewer";

const LeftDI = ({ item }) => {
  if (!item) return null;
  return (
    <div className="leftDI">
      <div className="container">
        <div className="item">
          {/* <img
            src={item.img}
            alt=""
          /> */}
          {item.model && <ModelViewer modelUrl={item.model} />}
        </div>
        <div className="item">
          <h2>Description</h2>
          <span>{item.description}</span>
        </div>

        <div className="item">
          <h2>Owner</h2>
          <div className="user">
            <div className="userInfo">
              <img
                src={item.profilePic}
                alt=""
              />
              <div className="online" />
              <span>{item.username}</span>
            </div>
            <div className="buttons">
              <button>follow</button>
            </div>
          </div>
        </div>

        <div className="item">
          <h2>Review</h2>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg"
                alt=""
              />
              <div className="online" />
              <span>Nino</span>
              <p>:</p>
              <p>That's a great product!</p>
            </div>
            <p>1 minago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftDI;
