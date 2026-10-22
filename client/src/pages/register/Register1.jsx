import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { makeRequest } from "../../api/axios";
import { ClipLoader } from "react-spinners";
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

  const [isshowpassword, setisshowpassword] = useState(false)
  useEffect(() => { // นับถอยหลัง cooldown OTP
    if (otpCooldown <= 0) return;

    const timer = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpCooldown]);

  // ================= STEP CONTROL =================
  const nextStep = () => {

    const trimmedUsername = username.trim();

    if (!/^(?=(?:.*[a-zA-Z]){3})[a-zA-Z0-9_ ]+$/.test(trimmedUsername)) {
      setError("Username must contain at least 3 letters and can only letters, include numbers, spaces, and underscores");
      return;
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 35) {
      setError("Username must be between 3 and 35 characters");
      return;
    }

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
    if (otpCooldown > 0 || otpLoading) return;
    setError("");
    setSuccess("");


    if (!email.trim()) {
      setError("Please enter your email before requesting OTP");
      return;
    }

    setOtpLoading(true);

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
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error); // จะแสดง error จาก backend
      } else {
        setError("Connect to server failed");
      }
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
          <div className="btn-login">
            <Link to="/login">
              <button>Login</button>
            </Link>
            <Link to="/">
              <button>Explore as Guest</button>
            </Link>
          </div>
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
                  type={isshowpassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type={isshowpassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />
                <div className="step1-buttons">
                  <button type="button" onClick={nextStep}>
                    Next
                  </button>
                  <button type="button" onClick={() => setisshowpassword(!isshowpassword)} >
                    {isshowpassword ? "Hide password" : "Show password"}
                  </button>
                </div>
                <div className="mobile-switch">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
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

                <div className="step2-buttons">
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={otpLoading || otpCooldown > 0}
                  >
                    {otpLoading ? (
                      <ClipLoader size={16} color="#ffffff" />
                    ) : otpCooldown > 0 ? (
                      `Resend OTP (${otpCooldown} s)`
                    ) : (
                      "OTP"
                    )}
                  </button>

                  <button type="button" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit">
                    Register
                  </button>
                </div>

                <div className="mobile-switch">
                  Already have an account? <Link to="/login">Login</Link>
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
