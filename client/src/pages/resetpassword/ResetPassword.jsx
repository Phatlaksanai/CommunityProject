import { useContext, useState } from "react";
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
  const [comfirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const nextStep = () => {
    if (password !== comfirmpassword) {
      setError("Passwords are not same.");
      return;
    }
    setError("");
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await makeRequest.post("/reset-password", {
        username,
        password,
      });

      // Backend ส่งของ user data มาให้
      if (res.data.success) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
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
                <button type="button">OTP</button>
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
              value={comfirmpassword}
              placeholder="Confirm Password"
              name="comfirmpassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="button-group">
                <button type="button" onClick={prevStep}>Back</button>
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