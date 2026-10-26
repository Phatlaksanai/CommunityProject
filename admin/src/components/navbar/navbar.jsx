import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { makeAdminRequest } from "../../api/axios";

const Navbar = () => {
  const { currentAdmin, setAdmin } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await makeAdminRequest.post("/admin/logout-admin");
      localStorage.removeItem("admin");
      localStorage.removeItem("accessTokenAdmin");
      setAdmin(null);
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

  const displayName = currentAdmin?.name || currentAdmin?.username || "Guest";
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
          <img src={currentAdmin?.profilePic || defaultPic} alt="" />
          <div className="user-info">
            <span className="custom-tooltip" data-tip={displayName}>
              {truncatedName}
            </span>
            <span>id: {currentAdmin?.user_id}</span>
          </div>
          {!currentAdmin && <button onClick={handleLogin}>Login</button>}
          {currentAdmin && <button onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;