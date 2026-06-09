import "./deleteaccount.scss";
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { AuthContext } from "../../context/authContext";

const DeleteAccount = () => {
    const navigate = useNavigate();
    // ดึงฟังก์ชัน logout หรือฟังก์ชันจัดการ State มาจาก AuthContext (ขึ้นอยู่กับชื่อที่คุณตั้งไว้ในไฟล์นั้น)
    const { currentUser, setUser } = useContext(AuthContext);

    const [Email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [otpCooldown, setOtpCooldown] = useState(0);
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        if (otpCooldown <= 0) return;

        const timer = setInterval(() => {
            setOtpCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [otpCooldown]);

    const handleSendOTP = async () => {

        if (otpCooldown > 0) return;
        setError("");
        setSuccess("");
        setOtpLoading(true);
        try {
            const res = await makeRequest.post("/send-otp-resetpassword", { email: Email });
            const data = res.data;
            if (data.success) {
                setSuccess("Sent OTP Successfully");
                setOtpCooldown(8);
            } else {
                setError(data.error || "OTP sending failed");
            }
        } catch (err) {
            setError("OTP sending failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await makeRequest.post("/deleteaccount", {
                email: Email,
                otp: otp,
                userId: currentUser.user_id
            });

            if (res.data.success) {
                setSuccess("Account deleted successfully");

                // เคลียร์ LocalStorage ที่หน้าบ้านเก็บไว้
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");

                // เคลียร์ LocalStorage ที่หน้าบ้านเก็บไว้
                setUser(null);

                navigate("/");
            }

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
        <div className="deleteaccount">
            <div className="add-item__form">
                <h1 className="add-item__title">Delete Account</h1>
                <form onSubmit={handleDeleteAccount}>
                    <div className="form-group">
                        <label htmlFor="itemDetail">Email</label>
                        <input type="email" id="itemDetail" placeholder="Email"
                            value={Email}
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

                    <div className="btn-group">
                        <button type="button" className="OTP" onClick={handleSendOTP} disabled={otpCooldown > 0 || otpLoading}>
                            {otpCooldown > 0 ? `Resend OTP (${otpCooldown} s)` : "OTP"}
                        </button>
                        <input type="submit" value="Delete" className="submit" />

                        {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                        {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteAccount;
