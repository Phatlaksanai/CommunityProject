import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // const res = await fetch("http://localhost:8080/api/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username, password }),
    // });

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message);
      setError(data.error || "Login Failed");
    } else {
      setSuccess("Login success");
      // setUser(data.user);   
      // เก็บ user ไว้ใช้ทั้ง app
      // ✅ แก้ตรงนี้ 1: รับค่า username มาสร้างเป็น Object
    setUser({ username: data.username });

      navigate("/");        // ไปหน้า Home
    }
  };
  
  return (
    <div className = "login">
      <div className="login-container">
        <div className="left-panel">
          <h1>Temu</h1>
          <p>
            Welcome to Temu community
            <br />
            There is a lot of fun !!!!
          </p>
        </div>

        <div className="right-panel">
          <h2>Login</h2>

          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}

          {success && (
            <div style={{ color: "#00ff00", marginBottom: 10 }}>{success}</div>
          )}

          <form onSubmit={handleLogin} className="form-login">
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

            <a href="#" className="forgot">
              forgot password
            </a>

            <div className="btns">
              <Link to="/register">
                <button type="button" className="create">create</button>
              </Link>

              <button type="submit" className="login-btn">login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
