import "./leftbar.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ArchiveIcon from '@mui/icons-material/Archive';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';

const LeftBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // เรียกใช้ useLocation เพื่อดู URL ปัจจุบัน
  const { currentUser } = useContext(AuthContext);

  // ฟังก์ชันเช็กว่า URL ปัจจุบันตรงกับเมนูหรือไม่
  const isActive = (path) => location.pathname.includes(path);
  
  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className={`item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate(`/dashboard`)} style={{ cursor: "pointer" }}>
            <HomeFilledIcon />
            <span>Home</span>
          </div>
        </div>

        <div className="menu">
          <div className={`item ${isActive('/users') ? 'active' : ''}`} onClick={() => navigate(`/users`)} style={{ cursor: "pointer" }}>
            <PermIdentityIcon />
            <span>Users</span>
          </div>
        </div>

        <div className="menu">
          <div className={`item ${isActive('/content&assets') ? 'active' : ''}`} onClick={() => navigate(`/content&assets`)} style={{ cursor: "pointer" }}>
            <ArchiveIcon />
            <span>Content <br /> & Assets</span>
          </div>
        </div>

        <div className="menu">
          <div className={`item ${isActive('/managefriends') ? 'active' : ''}`} onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <AccountBalanceWalletIcon />
            <span>Transactions</span>
          </div>
        </div>

        <div className="menu">
          <div className={`item ${isActive('/managefriends') ? 'active' : ''}`} onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <OutlinedFlagIcon />
            <span>Reports</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeftBar;