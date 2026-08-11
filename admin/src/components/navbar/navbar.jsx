import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await makeRequest.post("/logout");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Logout failed");
    }
  };

  const handleLogin = async () => {
    try {
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Login failed");
    }
  };

  const displayName = currentUser?.name || currentUser?.username || "Guest";
  const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 className="Logo">PM</h1>
        </Link>
      </div>

      <div className="right">
        <div className="user">
          <img src={currentUser?.profilePic || defaultPic} alt="" onClick={() => navigate(`/profile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
          <div className="user-info">
            <span className="custom-tooltip" data-tip={displayName}>
              {truncatedName}
            </span>
            <span>id: {currentUser?.user_id}</span>
          </div>
          {!currentUser && <button onClick={handleLogin}>Login</button>}
          {currentUser && <button onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;