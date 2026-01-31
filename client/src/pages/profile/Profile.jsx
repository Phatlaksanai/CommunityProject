import Posts from "../../components/posts/posts"
import { useParams } from "react-router-dom";
import "./profile.scss"

const Profile = () => {
  const { id } = useParams();
  return (
    <div className="profile">
      <Posts userId={id}/>
    </div>
  )
}

export default Profile