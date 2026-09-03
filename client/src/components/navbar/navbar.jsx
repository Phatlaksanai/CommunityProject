import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadIcon from '@mui/icons-material/Download';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";
import ReportModal from "../report/ReportModal";

// 🚀 [ปรับการ Import: เอา Hits ออก แล้วนำ useHits กับ useSearchBox มาจัดการเอง]
import { InstantSearch, SearchBox, useSearchBox, useHits } from 'react-instantsearch';
import { searchClient } from "../../api/algoliaClient";
import { div } from "three/src/nodes/TSL.js";

// ============================================================
// 1. คอมโพเนนต์ดรอปดาวน์เวอร์ชัน Custom (แก้บั๊กแวบ 0.2 วิ แบบเบ็ดเสร็จ)
// ============================================================
const CustomSearchResults = () => {
  const { results } = useHits();      // ดึงข้อมูลผลลัพธ์ดิบและสถานะการค้นหามาจาก Algolia
  const { query } = useSearchBox();    // ดึงคำค้นหาปัจจุบันในกล่องพิมพ์

  // 🛡️ ดักจับจังหวะแวบ: ถ้าคำในกล่องพิมพ์กับคำที่ระบบกำลังประมวลผลอยู่ไม่ตรงกัน (กำลังโหลด) 
  // หรือพิมพ์ยังไม่เสร็จ ให้ส่ง null ซ่อนหน้าต่างไปเลย ไม่ยอมให้ข้อมูลเก่าแวบขึ้นมาเด็ดขาด
  if (!query.trim() || !results || results.query !== query) {
    return null;
  }

  // ถ้าพิมพ์คำค้นหาแล้ว แต่ระบบหาไม่เจอจริง ๆ (ไม่มีข้อมูล)
  if (results.hits.length === 0) {
    return (
      <div className="search-dropdown-results">
        <div style={{ padding: "15px", color: "gray", fontSize: "13px", textAlign: "center" }}>
          No results found for "{query}"
        </div>
      </div>
    );
  }

  // เมื่องานทุกอย่างตรงล็อก (กรองเสร็จแล้วร้อยเปอร์เซ็นต์) ถึงจะยอมวาดการ์ดผลลัพธ์ขึ้นหน้าจอ
  return (
    <div className="search-dropdown-results">
      <ul className="ais-Hits-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.hits.map((hit) => (
          <li key={hit.objectID} className="ais-Hits-item">
            <SearchHit hit={hit} />
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================
// 2. ตัวแสดงผลการ์ดค้นหาแต่ละแถว (คงเดิม)
// ============================================================
const SearchHit = ({ hit }) => {
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  let targetLink = "/";
  if (hit.type === 'community') targetLink = `/descCommu/${hit.targetId}`;
  if (hit.type === 'item') targetLink = `/descItem/${hit.targetId}`;
  if (hit.type === 'user') targetLink = `/profile/${hit.targetId}`;

  return (
    <Link to={targetLink} className="search-hit-item">
      <div className="hit-content">
        <img src={hit.img || defaultPic} className="hit-image" />

        <div className="hit-info">
          <span className={`badge ${hit.type}`}>{hit.type.toUpperCase()}</span>
          <h4 className="hit-title">{hit.title}</h4>
          <p className="hit-desc">{hit.description ? hit.description.substring(0, 50) + "..." : null}</p>
        </div>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const { currentUser, setUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  // สถานะคุม เปิด/ปิด ดรอปดาวน์ผลลัพธ์เมื่อมีการ Focus กล่องพิมพ์
  const [isSearching, setIsSearching] = useState(false);

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
        <HomeOutlinedIcon onClick={() => navigate("/")} style={{ cursor: "pointer" }} />

        <StorefrontIcon onClick={() => navigate("/market")} style={{ cursor: "pointer" }} />
        <DownloadIcon onClick={() => navigate(`/download/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />

        {/* ============================================================ */}
        {/* โครงสร้างก้อนค้นหา Algolia เวอร์ชันเสถียรที่สุด ไร้อาการหลุดโฟกัส และไร้อาการแวบ */}
        {/* ============================================================ */}
        <div className="search-container-algolia">
          <InstantSearch searchClient={searchClient} indexName="WebCommunity_Search">
            <div className="search-box-wrapper">
              <SearchOutlinedIcon className="search-icon-inside" />
              <SearchBox
                placeholder="Search"
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 300)}
              />
            </div>

            {/* เรียกใช้คอมโพเนนต์ตรวจสอบตัวใหม่แทนก้อนสลับม่านตัวเดิม */}
            {isSearching && <CustomSearchResults />}
          </InstantSearch>
        </div>
        {/* ============================================================ */}
      </div>

      <div className="right">
        <AddShoppingCartIcon onClick={() => navigate(`/cart/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
        <PeopleIcon onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
        <ForumIcon onClick={() => navigate(`/boxchat/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
        <div className="user">
          <img src={currentUser?.profilePic || defaultPic} alt="" onClick={() => navigate(`/profile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
          <span className="custom-tooltip" data-tip={displayName}>
            <div className="NameAndBalance">
              <span>{truncatedName}</span>
              <p> 00.00 $</p>
            </div>
          </span>
          {!currentUser && <button onClick={handleLogin}>Login</button>}
          {currentUser &&
            <div className="more-container">
              <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: "pointer" }} />
              {menuOpen && (
                <div className="moreMenu">
                  <button onClick={() => setOpenReport(true)}>report</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}

            </div>
          }
        </div>
        <ReportModal
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          navbar={true}
        />
      </div>
    </div>
  );
};

export default Navbar;