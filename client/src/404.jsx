import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Cyberpunk404() {
  useEffect(() => {
    // ตั้งค่า Body ให้เป็นสีดำเต็มจอ
    document.body.style.margin = "0";
    document.body.style.backgroundColor = "#050505";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.overflow = "";
    };
  }, []);

  // สไตล์สำหรับพื้นหลัง Grid นีออน
  const gridStyle = {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "linear-gradient(rgba(0, 255, 247, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 247, 0.1) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    zIndex: 0,
  };

  // สไตล์คอนเทนเนอร์หลัก
  const containerStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#00f2ea",
    fontFamily: "'Courier New', Courier, monospace", // ใช้ฟอนต์แบบเครื่องพิมพ์ดีด
    position: "relative",
    zIndex: 10
  };

  // สไตล์ปุ่ม
  const buttonStyle = {
    marginTop: "30px",
    padding: "10px 30px",
    border: "2px solid #00f2ea",
    borderRadius: "20px",
    backgroundColor: "transparent",
    color: "#00f2ea",
    cursor: "pointer",
    fontSize: "14px",
    letterSpacing: "2px",
    transition: "0.3s",
    textDecoration: "none"
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Neon Grid Background */}
      <div style={gridStyle} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={containerStyle}
      >
        <motion.div
          animate={{ x: [0, 3, -3, 2, -2, 0] }} // เอฟเฟกต์สั่น (Glitch)
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: "relative", fontSize: "150px", fontWeight: "bold", lineHeight: 1 }}
        >
          {/* เงาสีชมพู */}
          <span style={{ position: "absolute", top: 0, left: "3px", color: "#ff0055", opacity: 0.7, zIndex: -1 }}>
            404
          </span>
          {/* เงาสีเขียว */}
          <span style={{ position: "absolute", top: 0, left: "-3px", color: "#00ff99", opacity: 0.7, zIndex: -2 }}>
            404
          </span>
          {/* ตัวหนังสือหลัก */}
          <span style={{ color: "#fff", textShadow: "0 0 20px #00f2ea" }}>404</span>
        </motion.div>

        <p style={{ marginTop: "-10px", fontSize: "20px", color: "#ccfbf9", textShadow: "0 0 10px #00f2ea" }}>
          SIGNAL LOST · PAGE NOT FOUND
        </p>

        <Link 
            to="/" 
            style={buttonStyle}
            onMouseOver={(e) => { e.target.style.background = "#00f2ea"; e.target.style.color = "#000"; }}
            onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#00f2ea"; }}
        >
          RETURN TO MAIN NODE
        </Link>
      </motion.div>
    </div>
  );
}