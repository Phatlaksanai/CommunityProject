import "./setting.scss";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { DarkModeContext } from "../../context/darkModeContext";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

const Setting = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toggle, darkMode } = useContext(DarkModeContext);
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="setting">
            <div className="container">
                <h1>Settings</h1>
                <div className="btn-group">
                    <button type="button" className="btn"
                        onClick={() => {
                            if (!currentUser?.user_id) {
                                navigate("/login");
                                return;
                            }
                            navigate(`/setting/${id}/changepassword`);
                        }}
                    >Change Password
                    </button>

                    {darkMode ? (
                        <WbSunnyOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
                    ) : (
                        <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
                    )}

                    <button type="button" className="btn delete"
                        onClick={() => {
                            if (!currentUser?.user_id) {
                                navigate("/login");
                                return;
                            }
                            navigate(`/setting/${id}/deleteaccount`);
                        }}
                    >Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Setting;
