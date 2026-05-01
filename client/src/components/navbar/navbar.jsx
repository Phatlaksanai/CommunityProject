import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadIcon from '@mui/icons-material/Download';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, setUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await makeRequest.post("/logout");

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

    // รีเฟรชหน้าเพื่อโหลด state ใหม่
    window.location.reload();

      navigate("/"); // เด้งไปหน้า Login
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  const DL = async () => {
    try {
      navigate("/"); // เด้งไปหน้า Login
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  const handleLogin = async () => {
    try {
      navigate("/login"); // เด้งไปหน้า Login
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 className="Logo">PM</h1>
        </Link>
        <HomeOutlinedIcon onClick={() => navigate("/")} style={{ cursor: "pointer" }}/>
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle}  style={{ cursor: "pointer" }}/>
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }}/>
        )}
        <AddShoppingCartIcon onClick={() => navigate("/download")} style={{ cursor: "pointer" }}/>
        <DownloadIcon/>
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        {/* {!user && (
          <>
            <Link to="/register"><button className="button">Register</button></Link>
            <Link to="/login"><button className="button">Login</button></Link>
          </>
        )}
        {user && (<button className="button" onClick={handleLogout}>Logout</button>)} */}
        <ShoppingBasketIcon />
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <div className="user">
          <img src={currentUser?.profilePic || defaultPic} alt="" onClick={() => navigate(`/profile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}/>
          <span>{currentUser?.name || currentUser?.username || "Guest"}</span>
          {!currentUser && (
            <button onClick={handleLogin}>
              Login
            </button>
          )}
          {currentUser && (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;