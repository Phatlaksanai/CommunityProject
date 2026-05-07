import "./changepassword.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";

const ChangePassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await makeRequest.post("/changepassword", {
                email: email,
                otp: otp,
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });

            setSuccess("Change password success");
            navigate(`/setting/${currentUser.id}/changepassword`);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to connect to server");
            }
        }
    };


    return (
        <div className="changepassword">
            <div className="add-item__form">
                <h1 className="add-item__title">Change Password</h1>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="itemDetail">Email</label>
                        <input type="email" id="itemDetail" placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDetail">OTP</label>
                        <input type="text" id="itemDetail" placeholder="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDetail">New Password</label>
                        <input type="text" id="itemDetail" placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="itemDetail">Confirm Password</label>
                        <input type="text" id="itemDetail" placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />
                    </div>
                    <div className="btn-group">
                        <button className="OTP">OTP</button>
                        <input type="submit" value="Submit" className="submit" />
                    </div>
                    {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                    {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
