import Friends from "../../components/PageItems/friends/friends"
import ScrollToTop from "../../ScrollToTop";
import { useParams } from "react-router-dom";
import "./manageFriend.scss"

const ManageFriend = () => {
  const { id } = useParams();
  return (
    <div className="managefriend">
      <ScrollToTop />
      <Friends userId={id} isfriend={true} />
    </div>
  )
}

export default ManageFriend