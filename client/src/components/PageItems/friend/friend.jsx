import "./friend.scss";
import "dayjs/locale/th";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import SettingsIcon from '@mui/icons-material/Settings';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useNavigate } from "react-router-dom";

const Friend = ({ user, isfriend }) => {

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const displayName = user.name || user.username;
    const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;

    return (
        <div className="friend">
            <div className="container">
                <div className="content" onClick={() => navigate(`/descitem/${user.user_id}`)} style={{ cursor: "pointer" }}>
                    <img src={user.profilePic} alt="" onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=Image+Error"; }} />
                </div>
                <div className="desc">
                    <h3 className="h3 custom-tooltip" data-tip={displayName}>
                        {truncatedName}
                    </h3>
                    <p>@{user.username}</p>
                </div>
                
            </div>
            {!isfriend && (
                <button>Add +</button>
            )}
        </div>
    );
};

export default Friend;
