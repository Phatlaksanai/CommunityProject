// import { Link } from "react-router-dom";

// import "./register.scss";

// const Register = () => {
//   return (
//     <div className="register">
//       <div className="card">
//         <div className="left">
//           <h1>PM.</h1>
//           <p>
//             There is a lot of fun. Community game development platform. Join us
//             now!
//           </p>
//           <span>Do you have an account?</span>
//           <Link to="/login">
//           <button>Login</button>
//           </Link>
//         </div>
//         <div className="right">
//           <h1>Register</h1>
//           <form>
//             <input type="text" placeholder="Username" />
//             <input type="email" placeholder="Email" />
//             <input type="password" placeholder="Password" />
//             <input type="text" placeholder="Name" />
//             <button>Register</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  // message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= STEP CONTROL =================
  const nextStep = () => {
    if (password !== password2) {
      setError("Passwords are not same.");
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
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมลก่อนกด OTP");
      return;
    }

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "ส่ง OTP ไม่สำเร็จ");
        return;
      }

      setSuccess("ส่งรหัส OTP แล้ว!");
    } catch (err) {
      setError("เชื่อมต่อ Server ไม่ได้");
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          password2,
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "การลงทะเบียนล้มเหลว");
        return;
      }

      setSuccess("Register success");
      navigate("/login");
    } catch (err) {
      setError("เชื่อมต่อ Server ไม่ได้");
    }
  };

  return (
    <div className="register">
      <div className="card">
        {/* LEFT */}
        <div className="left">
          <h1>PM.</h1>
          <p>
            There is a lot of fun. Community game development platform.
            Join us now!
          </p>
          <span>Do you have an account?</span>
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
                  <button type="button" onClick={sendOTP}>
                    OTP
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
