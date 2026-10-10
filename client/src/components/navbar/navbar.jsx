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
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";
import ReportModal from "../report/ReportModal";
import { useQuery, } from "@tanstack/react-query";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// 🚀 [ปรับการ Import: เอา Hits ออก แล้วนำ useHits กับ useSearchBox มาจัดการเอง]
import { InstantSearch, SearchBox, useSearchBox, useHits, Configure } from 'react-instantsearch';
import { searchClient } from "../../api/algoliaClient";

// ============================================================
// 1. คอมโพเนนต์ดรอปดาวน์เวอร์ชัน Custom (แก้บั๊กแวบ 0.2 วิ แบบเบ็ดเสร็จ)
// ============================================================
const CustomSearchResults = () => {
  const { results } = useHits();      // ดึงข้อมูลผลลัพธ์ดิบและสถานะการค้นหามาจาก Algolia
  const { query } = useSearchBox();    // ดึงคำค้นหาปัจจุบันในกล่องพิมพ์

  // 🛡️ ดักจับจังหวะแวบ: ถ้าคำในกล่องพิมพ์กับคำที่ระบบกำลังประมวลผลอยู่ไม่ตรงกัน (กำลังโหลด) 
  // หรือพิมพ์ยังไม่เสร็จ ให้ส่ง null ซ่อนหน้าต่างไปเลย ไม่ยอมให้ข้อมูลเก่าแวบขึ้นมาเด็ดขาด
  if (!query.trim() || !results) {
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
          <div className="hit-type-category">
            <span className={`badge ${hit.type}`}>{hit.type.toUpperCase()}</span>
            {hit.category && (
              <span className="hit-category">
                {hit.category}
              </span>
            )}
          </div>
          <h4 className="hit-title">{hit.title}</h4>
          <p className="hit-desc">{hit.description ? hit.description.substring(0, 50) + "..." : null}</p>
        </div>
      </div>
    </Link>
  );
};

const CustomSearchBox = ({ searchText, setSearchText, onFocus, onBlur }) => {
  const { refine } = useSearchBox();

  // ทุกครั้งที่ searchText ของเราเปลี่ยน (หรือ filter เปลี่ยนแล้ว InstantSearch รีเซ็ต)
  // ให้ส่งคำค้นหาเดิมเข้า Algolia ซ้ำเสมอ
  useEffect(() => {
    refine(searchText);
  }, [searchText, refine]); // refine เป็นฟังก์ชันที่ได้จาก hook useSearchBox() เก็บคำค้นหาไว้แล้วส่งไป Algolia

  return (
    <input
      type="search"
      className="ais-SearchBox-input"
      placeholder="Search for community, item, or user..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

const Navbar = () => {
  const { currentUser, setUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  // สถานะคุม เปิด/ปิด ดรอปดาวน์ผลลัพธ์เมื่อมีการ Focus กล่องพิมพ์
  const [isSearching, setIsSearching] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: () => makeRequest.get(`/items/categories`).then(res => res.data)
  });

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

  useEffect(() => {
    const fetchLatestBalance = async () => {
      if (!currentUser?.user_id) return;

      try {
        // เปลี่ยน endpoint ด้านล่างนี้ ให้ตรงกับ API ดูข้อมูล User ของคุณ
        const res = await makeRequest.get(`/user/${currentUser.user_id}`);

        // หากยอดเงินจาก Database ไม่ตรงกับยอดเงินใน State ปัจจุบัน ให้อัปเดต State
        if (res.data && res.data.balance !== currentUser.balance) {

          // ใช้ setUser เพื่ออัปเดต Context (และ AuthContext จะเซฟลง localStorage ให้อัตโนมัติ)
          setUser((prev) => ({
            ...prev,
            username: res.data.username,
            name: res.data.name,
            profilePic: res.data.profilePic,
            balance: res.data.balance
          }));

        }
      } catch (err) {
        console.error("Failed to fetch latest balance:", err);
      }
    };
    fetchLatestBalance(); // ดึงข้อมูลทันทีเมื่อ Navbar โหลดขึ้นมา

    // [ตัวเลือกเสริม] หากอยากให้ตัวเลขอัปเดตเองตอน Webhook ทำงานเสร็จแบบกึ่ง Real-time 
    // สามารถตั้ง Polling ให้เช็คยอดเงินใหม่ทุกๆ 10 วินาทีได้:
    const intervalId = setInterval(fetchLatestBalance, 10000); // 10000 ms = 10 วินาที
    return () => clearInterval(intervalId); // Cleanup เมื่อเปลี่ยนหน้า

  }, [currentUser?.user_id, setUser]);

  useEffect(() => {
    if (openReport) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openReport]);

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
        <DownloadIcon
          onClick={() => {
            if (!currentUser?.user_id) {
              navigate("/login");
              return;
            }
            navigate(`/download/${currentUser.user_id}`);
          }}
          style={{ cursor: "pointer" }}
        />

        {/* ============================================================ */}
        {/* โครงสร้างก้อนค้นหา Algolia เวอร์ชันเสถียรที่สุด ไร้อาการหลุดโฟกัส และไร้อาการแวบ */}
        {/* ============================================================ */}
        <div className="search-container-algolia">
          <InstantSearch searchClient={searchClient} indexName="WebCommunity_Search">
            {/* ใช้ configure ให้ Dropdown กรอง Algolia */}
            <Configure filters={filterCategory === "all" ? "" : `category:"${filterCategory}"`} />
            <div className="search-box-wrapper">
              <SearchOutlinedIcon className="search-icon-inside" />
              <CustomSearchBox
                placeholder="Search"
                searchText={searchText}
                setSearchText={setSearchText}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 300)}
              />
            </div>

            {/* เรียกใช้คอมโพเนนต์ตรวจสอบตัวใหม่แทนก้อนสลับม่านตัวเดิม */}
            {isSearching && <CustomSearchResults />}
          </InstantSearch>
        </div>
        {/* ============================================================ */}

        <div className="select-wrapper">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setIsSearching(true); // เปิดผลลัพธ์ให้เห็นผลการกรองทันที
            }}
          >
            <option value="all">All Categories</option>

            {categories?.map((category) => (
              <option
                key={category.category_id}
                value={category.type}
              >
                {category.type}
              </option>
            ))}
          </select>

          <ArrowDropDownIcon className="dropdown-icon" />
        </div>

      </div>

      <div className="right">
        <AddShoppingCartIcon onClick={() => {
          if (!currentUser?.user_id) {
            navigate("/login");
            return;
          }
          navigate(`/cart/${currentUser?.user_id}`)
        }}
          style={{ cursor: "pointer" }}
        />
        <PeopleIcon onClick={() => {
          if (!currentUser?.user_id) {
            navigate("/login");
            return;
          }
          navigate(`/managefriends/${currentUser?.user_id}`)
        }}
          style={{ cursor: "pointer" }}
        />
        <ForumIcon onClick={() => {
          if (!currentUser?.user_id) {
            navigate("/login");
            return;
          }
          navigate(`/boxchat/${currentUser?.user_id}`)
        }}
          style={{ cursor: "pointer" }}
        />
        <div className="user">
          <img src={currentUser?.profilePic || defaultPic} alt="" onClick={() => navigate(`/profile/${currentUser?.user_id}`)} style={{ cursor: "pointer" }} />
          <span className="custom-tooltip" data-tip={displayName}>
            <div className="NameAndBalance">
              <span>{truncatedName}</span>
              <p>{currentUser?.balance?.toFixed(2) || "0.00"} $</p>
            </div>
          </span>
          {!currentUser && <button onClick={handleLogin} className="loginbtn">Login</button>}
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