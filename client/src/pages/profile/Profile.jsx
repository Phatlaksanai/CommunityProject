import Posts from "../../components/PageItems/posts/posts"
import { useParams } from "react-router-dom";
import ScrollToTop from "../../ScrollToTop";
import "./profile.scss"

const Profile = () => {
  const { id } = useParams();
  return (
    <div className="profile">
      <ScrollToTop />
      <Posts userId={id}/>
    </div>
  )
}

export default Profile