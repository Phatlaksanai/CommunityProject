import "./leftbar.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { useContext } from "react";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ArchiveIcon from '@mui/icons-material/Archive';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';

const LeftBar = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <HomeFilledIcon />
            <span>Home</span>
          </div>
        </div>

        <div className="menu">
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <PermIdentityIcon />
            <span>Users</span>
          </div>
        </div>

        <div className="menu">
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <ArchiveIcon />
            <span>Content <br /> & Assets</span>
          </div>
        </div>

        <div className="menu">
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <AccountBalanceWalletIcon />
            <span>Transactions</span>
          </div>
        </div>

        <div className="menu">
          <div className="item" onClick={() => navigate(`/managefriends/${currentUser?.user_id}`)} style={{ cursor: "pointer" }}>
            <OutlinedFlagIcon />
            <span>Reports</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeftBar;