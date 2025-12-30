import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, setUser } = useContext(AuthContext);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await makeRequest.post("/logout");

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

      // ถ้าใน Context มีฟังก์ชันล้าง user ให้เรียกใช้ (ถ้าไม่มีให้ข้ามบรรทัดนี้)
      // setUser(null); 

      navigate("/login"); // เด้งไปหน้า Login
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 className="Logo">PM</h1>
        </Link>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
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
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <div className="user">
          <img src={currentUser.profilePic} alt="" />
          <span>{currentUser.name}</span>
          <button onClick={handleLogout} style={{marginLeft: "10px", cursor: "pointer"}}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;