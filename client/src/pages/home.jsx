import { useState ,useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // เอา css เดิมมาใช้ได้เลย
import { makeRequest } from "../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // โหลด Plugin "เมื่อสักครู่"
import "dayjs/locale/th"; // โหลดภาษาไทย (ถ้าอยากได้อังกฤษไม่ต้องใส่)

dayjs.extend(relativeTime);
dayjs.locale("th");

export default function Home({ user, setUser}) {
  const [posts, setPosts] = useState([]); // เก็บข้อมูลโพสต์ที่ดึงจาก DB
  const [text, setText] = useState("");
  
  // ดึงข้อมูลเมื่อโหลดหน้าเว็บ (Load Posts)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await makeRequest.get("/posts");
        setPosts(res.data); // เอาข้อมูลจาก DB ยัดใส่ State
      } catch (err) {
        console.log(err);
      }
    };
    fetchPosts();
  }, []); // [] แปลว่าทำครั้งเดียวตอนเปิดหน้าเว็บ
  
  const addPost = async (e) => {
    e.preventDefault();

    if (text.trim() === "") {
      alert("กรุณากรอกข้อความก่อนโพสต์");
      return;
    }

    try {
      // ส่งแค่ text, userId ไม่ต้องส่งเพราะอยู่ใน Cookie/Token แล้ว
      await makeRequest.post("/posts", { desc: text, img: null });
      setText("");
      // รีโหลดหน้าจอเพื่อดึงข้อมูลใหม่มาโชว์ (วิธีง่ายสุด)
      window.location.reload(); 
    } catch (err) {
      console.log(err);
    }
    setPosts([...posts, text]);
    // setText("");
    
  };

  // logout
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await makeRequest.post("/logout"); // => /api/logout
      setUser(null);                     // ล้าง user
      navigate("/");                // หรือ "/"
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div className="Home">
        <div className="TopPage">
          <h1 className="Logo">PM</h1>

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
            {user && (<button className="button" onClick={handleLogout}>Logout</button>)}

            {/* ปุ่มทดสอบ API (คงไว้ตามเดิม) */}
            <button onClick={async () => {
              try {
                const res = await makeRequest.post("/");
                alert(res.data);
              } catch (err) {
                console.error(err);
                alert("Server อ่าน Token ไม่ได้");
              }
            }}>
              ทดสอบยิง API
            </button>
          </div>

          {user && (
            <div style={{ color: "#fff", position: "absolute", right: "100px" }}>
              {user.username}
            </div>
          )}

          <img
            src={user?.profilePic || "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"}
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

          {/* ================= POSTS (จุดที่แก้ไข) ================= */}
          <div id="M" className="M-space">
            <div id="news">ป้ายเลื่อนๆ</div>

            <div className="TabPost">
              {/* ส่วนฟอร์มเขียนโพสต์ (คงไว้ตามเดิม) */}
              <div className="BarWrite">
                <div className="left-panel">
                  <img
                    src={user?.profilePic || "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"}
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

              {/* ====== RENDER POSTS (แก้ไขตรงนี้) ====== */}
              {posts.map((post) => (
                <div className="BarWrite" key={post.post_id}> {/* ✅ ใช้ post_id ให้ตรงกับ DB */}
                  
                  <div className="left-panel">
                    {/* แสดงรูปโปรไฟล์ของเจ้าของโพสต์ */}
                    <img
                      src={post.profilePic || "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"}
                      alt="profile"
                      id="profile"
                    />
                  </div>

                  <div className="right-panel">
                    {/* ส่วนหัว: ชื่อคนโพสต์ + เวลา (เพิ่มใหม่ให้ดูง่ายขึ้น) */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "14px" }}>{post.username}</span>
                        <span style={{ fontSize: "12px", color: "gray" }}>
                            {dayjs(post.createdAt).fromNow()} {/* ✅ ใช้ dayjs แปลงเวลา */}
                        </span>
                    </div>

                    {/* ข้อความโพสต์ */}
                    <p style={{ margin: "5px 0" }}>{post.desc || post.description}</p>

                    {/* รูปภาพในโพสต์ (ถ้ามี) */}
                    {post.img && <img src={"./upload/" + post.img} alt="post-img" style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }} />}

                    {/* ไอคอน Like/Comment (คงไว้ตามเดิม) */}
                    <div style={{ marginTop: "10px" }}>
                        <img
                          src="https://images.icon-icons.com/1097/PNG/512/1485477009-like_78561.png"
                          alt="like"
                          id="profile"
                          style={{ marginRight: "10px", width: "20px", height: "20px" }}
                        />
                        <img
                          src="https://images.icon-icons.com/1097/PNG/512/1485477216-cloud-text_78566.png"
                          alt="comment"
                          id="profile"
                          style={{ width: "20px", height: "20px" }}
                        />
                    </div>
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
