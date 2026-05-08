import "./changepassword.scss";
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const { currentUser } = useContext(AuthContext);

    const [Email, setEmail] = useState("");
    const [OTP, setOTP] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    const nextStep = async () => {
        setError("");
        setSuccess("");
        try {
            const res = await makeRequest.post("/verify-otp-resetpassword", {
                email: Email,
                otp: OTP
            });
            const data = res.data;
            if (data.success) {
                setStep(2);
            } else {
                setError("OTP is incorrect");
            }
        } catch (err) {
            setError(err.response?.data?.error || "OTP is incorrect");
        }
    };
    const prevStep = () => {
        setStep(1);
    };

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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await makeRequest.post("/reset-password", {
                email: Email,
                password: newPassword,
                confirmpassword: confirmPassword
            });

            const data = res.data;
            if (data.success) {
                setSuccess("Change password success");
                setTimeout(() => {
                    navigate(`/setting/${currentUser.id}`);
                }, 1500);
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
        <div className="changepassword">
            <div className="add-item__form">
                <h1 className="add-item__title">Change Password</h1>
                <form onSubmit={handleChangePassword}>
                    {step === 1 && (
                        <>
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
                                    value={OTP}
                                    onChange={(e) => setOTP(e.target.value)}
                                    required />
                            </div>

                            <div className="btn-group">
                                <button type="button" className="btn" onClick={handleSendOTP} disabled={otpCooldown > 0 || otpLoading}>
                                    {otpCooldown > 0 ? `Resend OTP (${otpCooldown} s)` : "OTP"}
                                </button>
                                <button type="button" className="submit" onClick={nextStep}>Confirm</button>

                                {error && <span style={{ color: "red" }}>{error}</span>}
                                {success && <span style={{ color: "green" }}>{success}</span>}
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="form-group">
                                <label htmlFor="itemDetail">New Password</label>
                                <input type="password" id="itemDetail" placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="itemDetail">Confirm Password</label>
                                <input type="password" id="itemDetail" placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required />
                            </div>

                            <div className="btn-group">
                                <input type="submit" value="Confirm" className="submit" />

                                {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                                {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                            </div>
                        </>
                    )}

                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
