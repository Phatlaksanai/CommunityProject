import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import "./register.scss";

const Register = () => {
  const navigate = useNavigate();

  // step
  const [step, setStep] = useState(1);

  // form data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isdelete, setIsdelete] = useState("active");

  // message
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

  // ================= STEP CONTROL =================
  const nextStep = () => {
    if (password !== password2) {
      setError("Passwords are not same");
      return;
    }
    if (password.length < 10 || password.length > 20) {
      setError("Password must be between 10 and 20 characters");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one special character");
      return;
    }
    setError("");
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  // ================= SEND OTP =================
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
      const res = await makeRequest.post("/send-otp-register", { email });
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

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await makeRequest.post("/register", {
        username,
        password,
        password2,
        email,
        otp,
        isdelete
      });
      const data = res.data;

      if (data.success) {
        setSuccess("Register success");
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to server");
      }
    }
  };

  return (
    <div className="register">
      <div className="card">
        {/* LEFT */}
        <div className="left">
          <h1>PM.</h1>
          <p>
            Join our community of creators! Whether you're developing games or crafting 3D models, this is the perfect place to unleash your creativity.
          </p>
          <span>Join us now!</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>

        {/* RIGHT */}
        <div className="right">
          <h1>Register</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "#00ff00" }}>{success}</p>}

          <form onSubmit={handleRegister}>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={otpCooldown > 0 || otpLoading}
                  >
                    {otpCooldown > 0 ? `Resend OTP (${otpCooldown} s)` : "OTP"}
                  </button>

                  <button type="button" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit">
                    Register
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
