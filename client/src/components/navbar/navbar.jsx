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
import { useState, useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";

// 🚀 [เพิ่มการ Import สำหรับ Algolia v5 และ InstantSearch]
import { algoliasearch } from 'algoliasearch';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';
import { searchClient } from "../../api/algoliaClient";

// ============================================================
// 1. วางตัวแสดงผลการ์ดค้นหาแต่ละแถวไว้ตรงนี้ (ก่อนตัว Navbar)
// ============================================================
const SearchHit = ({ hit }) => {
  let targetLink = "/";
  // แมปปิ้งหน้าดีไซน์ปลายทางตามความเหมาะสมในโปรเจกต์ของคุณ
  if (hit.type === 'community') targetLink = `/descCommu/${hit.targetId}`;
  if (hit.type === 'item') targetLink = `/descItem/${hit.targetId}`;

  return (
    <Link to={targetLink} className="search-hit-item">
      <div className="hit-content">
        <span className={`badge ${hit.type}`}>{hit.type.toUpperCase()}</span>
        <h4 className="hit-title">{hit.title}</h4>
        <p className="hit-desc">{hit.description?.substring(0, 50)}...</p>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, setUser } = useContext(AuthContext);

  const [error, setError] = useState("");

  // 2. วาง State คุม เปิด/ปิด ดรอปดาวน์ผลลัพธ์ ไว้ตรงนี้ครับ
  const [isSearching, setIsSearching] = useState(false);

  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await makeRequest.post("/logout");

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

      // เคลียร์ค่า currentUser ใน AuthContext ให้เป็น null ทันที
      setUser(null);
      
      navigate("/");

    } catch (err) {
      console.error(err);
      setError("Logout failed");
    }
  };

  const DL = async () => {
    try {
      navigate("/"); // เด้งไปหน้า Login
    } catch (err) {
      console.error(err);
      setError("Logout failed");
    }
  };

  const handleLogin = async () => {
    try {
      navigate("/login"); // เด้งไปหน้า Login
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
        <HomeOutlinedIcon onClick={() => navigate("/")} style={{ cursor: "pointer" }} />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
        )}
        <AddShoppingCartIcon onClick={() => navigate("/market")} style={{ cursor: "pointer" }} />
        <DownloadIcon onClick={() => navigate("/download")} style={{ cursor: "pointer" }} />
        {/* <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div> */}
        {/* ============================================================ */}
        {/* 3. แทนที่ชุดค้นหาเดิม ด้วยก้อนโครงข่ายของ Algolia ตรงจุดนี้ครับ */}
        {/* ============================================================ */}
        <div className="search-container-algolia">
          <InstantSearch searchClient={searchClient} indexName="WebCommunity_Search">
            <div className="search-box-wrapper">
              <SearchOutlinedIcon className="search-icon-inside" />
              <SearchBox 
                placeholder="Search everything..." 
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 300)} // หน่วงเวลาเล็กน้อยให้ Event คลิกไปหน้าอื่นทำงานเสร็จก่อนกล่องยุบ
              />
            </div>
            
            {/* ดรอปดาวน์รายการผลลัพธ์ที่จะเด้งสไลด์ลงมาเมื่อมีการ Focus ที่กล่องข้อความ */}
            {isSearching && (
              <div className="search-dropdown-results">
                <Hits hitComponent={SearchHit} />
              </div>
            )}
          </InstantSearch>
        </div>
        {/* ============================================================ */}
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
        <PersonOutlinedIcon onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
        <EmailOutlinedIcon onClick={() => navigate(`/boxchat/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
        <div className="user">
          <img src={currentUser?.profilePic || defaultPic} alt="" onClick={() => navigate(`/profile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
          <span className="custom-tooltip" data-tip={displayName}>
            {truncatedName}
          </span>
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