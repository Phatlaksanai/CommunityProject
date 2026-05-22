import LeftChat from "../../components/Left/leftChat/leftChat"
import Posts from "../../components/PageItems/posts/posts"
import { useParams } from "react-router-dom";

import "./chat.scss"
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const Chat = () => {
    const { id } = useParams();

    return (
        <div className="chat">
            <div className="Lchat">
                <div className="search">
                    <input type="text" placeholder="Search..." />
                </div>
                <LeftChat userId={id} />
            </div>

            <div className="Rchat">
                {/* ส่วน Header ของแชท */}
                <div className="chatHeader">
                    <div className="userInfo">
                        <img src="https://cdn.vcgamers.com/news/wp-content/uploads/2023/02/PODUSZKA-ROBLOX-MAN-FACE-PREZENT.jpg" alt="" />
                        <div className="online" />
                        <span>Nino</span>
                    </div>
                </div>

                {/* ส่วนเนื้อหาแชทที่เลื่อนได้ */}
                <div className="chatContent">
                    {/* <Posts /> */}
                </div>

                {/* ส่วนช่อง Input พิมพ์ข้อความ */}
                <div className="chatInput">
                    <ImageIcon style={{ cursor: "pointer" }} />
                    <div className="search">
                        <input type="text" placeholder="Text..." />
                    </div>
                    <ThumbUpAltIcon style={{ cursor: "pointer" }} />
                </div>
            </div>
        </div>

    )
}

export default Chat