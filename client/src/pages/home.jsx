import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // เอา css เดิมมาใช้ได้เลย

export default function Home({ user }) {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([]);

  const addPost = (e) => {
    e.preventDefault();

    if (text.trim() === "") {
      alert("กรุณากรอกข้อความก่อนโพสต์");
      return;
    }

    setPosts([...posts, text]);
    setText("");
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
    <div className = "Home">
      <div className="TopPage">
        <h1 className="Logo">Temu</h1>

        <div className="menubar">
          <Link to="/"><button className="button">Home</button></Link>
          <Link to="/report"><button className="button">Report</button></Link>
          <Link to="/upload"><button className="button">Upload</button></Link>
          {!user && (
            <>
              <Link to="/register"><button className="button">Register</button></Link>
              <Link to="/login"><button className="button">Login</button></Link>
            </>
          )}
        </div>

        {user && (
          <div style={{ color: "#fff", position: "absolute", right: "100px" }}>
            {user.username}
          </div>
        )}

        <img
          src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
          alt="profile"
          id="profile"
        />
      </div>

      {/* ================= BODY ================= */}
      <div className="all-space">
        <div className="L-space">
          <div className="container">
            <a href="https://www.roblox.com/home">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/48/Roblox_Logo_2021.png"
                alt="roblox"
                id="robloxlogo"
                className="box"
              />
            </a>
            <div className="box">1</div>
            <div className="box">2</div>
            <div className="box">3</div>
            <div className="box">4</div>
          </div>
        </div>

        {/* ================= POSTS ================= */}
        <div id="M" className="M-space">
          <div id="news">ป้ายเลื่อนๆ</div>

          <div className="TabPost">
            <div className="BarWrite">
              <div className="left-panel">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                  alt="profile"
                  id="profile"
                />
              </div>

              <div className="right-panel">
                <form onSubmit={addPost}>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="btns">
                    <button type="submit" className="but">Post</button>
                    <input type="file" accept=".glb,.gltf" multiple />
                  </div>
                </form>
              </div>
            </div>

            {/* ====== RENDER POSTS ====== */}
            {posts.map((p, i) => (
              <div className="BarWrite" key={i}>
                <div className="left-panel">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                    alt="profile"
                    id="profile"
                  />
                </div>
                <div className="right-panel">
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="R-space"></div>
      </div>
    </div>
    </>
  );
}
