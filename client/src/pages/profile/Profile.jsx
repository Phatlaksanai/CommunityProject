import Posts from "../../components/PageItems/posts/posts"
import LeftDC from "../../components/Left/leftDC/leftDC"
import { useParams } from "react-router-dom";
import ScrollToTop from "../../ScrollToTop";
import "./profile.scss"

const Profile = () => {
  const { id } = useParams();
  return (
    <div className="profile">
      <ScrollToTop />
      <div className="all">
        <div className="L">
          <Posts userId={id} />
        </div>
        <div className="R">
          <LeftDC userId={id} isProfile={true} />
        </div>
      </div>

    </div>
  )
}

export default Profile