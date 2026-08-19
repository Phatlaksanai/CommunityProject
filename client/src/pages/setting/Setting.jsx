import "./setting.scss";
import { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

const Setting = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { toggle, darkMode } = useContext(DarkModeContext);

    return (
        <div className="setting">
            <div className="add-item__form">
                <h1 className="add-item__title">Settings</h1>

                {/* <div className="form-group">
                    <label htmlFor="itemName">Text Sizes</label>
                    <input type="text" id="itemName" placeholder="Text Size"
                        required />
                </div> */}

                <div className="btn-group">
                    <button type="button" className="Changepassword"
                        onClick={() => navigate(`/setting/${id}/changepassword`)}
                        style={{ cursor: "pointer" }}>
                        Change Password
                    </button>

                    {darkMode ? (
                        <WbSunnyOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
                    ) : (
                        <DarkModeOutlinedIcon onClick={toggle} style={{ cursor: "pointer" }} />
                    )}

                    <button type="button" className="Deleteaccount"
                        onClick={() => navigate(`/setting/${id}/deleteaccount`)}>
                        Delete Account
                    </button>

                </div>
                {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
            </div>
        </div>
    );
};

export default Setting;
