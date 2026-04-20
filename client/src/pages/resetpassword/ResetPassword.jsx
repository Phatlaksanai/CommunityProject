import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";
import "./resetpassword.scss";

const ResetPassword = () => {

  const navigate = useNavigate()
  const [step, setStep] = useState(1);
  const { setUser } = useContext(AuthContext);

  const [Email, setEmail] = useState("");
  const [OTP, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => { // นับถอยหลัง cooldown OTP
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

    if (res.data.success) {
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
    try {
    await makeRequest.post("/send-otp-resetpassword", { email: Email });
    setSuccess("Sent OTP Successfully");
    setOtpCooldown(8);
  } catch (err) {
    setError("OTP sending failed");
  }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await makeRequest.post("/reset-password", {
        email: Email,
        password,
        confirmpassword,
      });

      if (res.data.success) {
      setSuccess("Reset password success");
      navigate("/login");
    }
    } catch (err) {
      setError(err.response?.data?.error || "Reset password failed");
    }
  };
  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>PM.</h1>
          <p>
            There is a lot of fun. Community game development platform. Join us
            now!
          </p>
          <span>Don't you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Reset Password</h1>
          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}

          {success && (
            <div style={{ color: "#00ff00", marginBottom: 10 }}>{success}</div>
          )}
          <form onSubmit={handleResetPassword} className="form-login">
            {step === 1 && (
              <>
            <input
              type="text"
              value={Email}
              placeholder="Email"
              name="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              value={OTP}
              placeholder="OTP"
              name="OTP"
              onChange={(e) => setOTP(e.target.value)}
              required
            />
            <div className="button-group">
                <button type="button" onClick={handleSendOTP} disabled={otpCooldown > 0 || otpLoading}>
                    {otpCooldown > 0 ? `Resend OTP (${otpCooldown} s)` : "OTP"}
                </button>
                <button type="button" onClick={nextStep}>Confirm</button>
            </div>           
            </>
            )}

            {step === 2 && (
              <>
            <input
              type="password"
              value={password}
              placeholder="New Password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              value={confirmpassword}
              placeholder="Confirm Password"
              name="confirmpassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="button-group">
                <button type="submit" className="login-btn">Confirm</button>
            </div>
            </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;