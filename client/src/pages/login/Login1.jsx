import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../api/axios";
import "./login.scss";

const Login = () => {

  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext); // ใช้ context ตรง ๆ

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await makeRequest.post("/login", {
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
          <Link to="/register">
            <button>Register</button>
          </Link>
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
              value={username}
              placeholder="Username"
              name="username"
              onChange={(e) => setUsername(e.target.value)}
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
            <a href="" className="forgot" onClick={() => navigate("/resetpassword")} style={{ cursor: "pointer" }}>
              forgot password
            </a>
            <button type="submit" className="login-btn">login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;