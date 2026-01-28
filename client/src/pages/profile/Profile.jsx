import Posts from "../../components/posts/posts"
import Items from "../../components/items/items"
import Share from "../../components/share/share"
import "./profile.scss"

const Profile = () => {
  return (
    <div className="profile">
      <Share />
      <Posts />
      {/* <Items /> */}
    </div>
  )
}

export default Profile