import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
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
  const [message, setMessage] = useState("");

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
//   const sendOTP = async () => {
//     if (!email.trim()) {
//       alert("กรุณากรอกอีเมลก่อนกด OTP");
//       return;
//     }

    const sendOTP = async () => {
    // 1. ล้าง Error เก่าทิ้งก่อน
    setError(""); 

    if (!email.trim()) {
      // 2. เปลี่ยนจาก alert เป็น setError
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

      if (data.success) {
        alert("ส่งรหัส OTP แล้ว! (เช็คในอีเมล)"); // อันนี้อาจจะยังใช้ alert ได้ เพราะเป็นข่าวดี
      } else {
        // 3. ถ้า Backend แจ้ง error มา (เช่น ส่งไม่ไป) ก็โชว์ตัวหนังสือสีแดง
        setError(data.error || "ส่ง OTP ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("เชื่อมต่อ Server ไม่ได้");
    }

    // const res = await fetch("http://localhost:8080/api/send-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });


  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // const res = await fetch("http://localhost:8080/api/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     username,
    //     password,
    //     password2,
    //     email,
    //     otp,
    //   }),
    // });


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

    // เช็ค status code (ถ้าไม่ใช่ 200-299 ถือว่า error)
      if (!res.ok) {
        // ดึง key "error" ที่ backend ส่งมา
        setError(data.error || "การลงทะเบียนล้มเหลว");
        return;
      }
      alert("Register success!");
      navigate("/login");
  };

  return (
    <div className="register">
      <div className="register-container">
        <div className="left-panel">
          <h1>PM</h1>
          <p>
            Welcome to PM community
            <br />
            There is a lot of fun !!!!
          </p>
        </div>

        <div className="right-panel">
          <h2>Register</h2>

          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

          <form className="form-register" onSubmit={handleRegister}>
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <div className="step active">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <label>Confirm Password</label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                />

                <div className="btns">
                  <button type="submit" className="next" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <div className="step active">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <div className="btns">
                  <button type="button" className="back" onClick={sendOTP}>
                    OTP
                  </button>
                  <button type="button" className="back" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit" className="submit">
                    submit
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
