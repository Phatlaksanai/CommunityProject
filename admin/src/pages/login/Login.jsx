import { useContext, useState ,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";
import "./login.scss";

const Login = () => {
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext); // ใช้ context ตรง ๆ

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otp, setOtp] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (otpCooldown <= 0) return;

    const timer = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await makeRequest.post("/admin/login-admin", {
        email,
        password,
        otp
      });
      const data = res.data;
      // Backend ส่งของ user data มาให้
      if (data.success) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
    }
  };

  const sendOTP = async () => {
      if (otpCooldown > 0) return;
      setError("");
      setSuccess("");
      setOtpLoading(true);
  
      if (!email.trim()) {
        setError("Please enter your email before requesting OTP");
        setOtpLoading(false);
        return;
      }
  
      try {
        const res = await makeRequest.post("/admin/send-otp", { email });
        const data = res.data;
        if (data.success) {
          setSuccess("Send OTP Successfully");
          setOtpCooldown(8);
        } else {
          setError(data.error || "OTP sending failed");
        }
      } catch (err) {
        setError("Connect to server failed");
      } finally {
        setOtpLoading(false);
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
        </div>
        <div className="right">
          <h1>Login</h1>
          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}

          {success && (
            <div style={{ color: "#00ff00", marginBottom: 10 }}>{success}</div>
          )}
          <form onSubmit={handleLogin} className="form-login">
            <input
              type="text"
              value={email}
              placeholder="Email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="otp"
              value={otp}
              placeholder="OTP"
              name="otp"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: "10px" }}>
                <button
                    type="button"
                    onClick={sendOTP}
                    disabled={otpCooldown > 0 || otpLoading}
                >
                    {otpCooldown > 0 ? `Resend OTP (${otpCooldown} s)` : "OTP"}
                </button>
                <button type="submit" className="login-btn">login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;