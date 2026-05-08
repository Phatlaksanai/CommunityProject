import Friends from "../../components/PageItems/friends/friends"
import { useParams } from "react-router-dom";
import "./manageFriend.scss"

const ManageFriend = () => {
  const { id } = useParams();
  return (
    <div className="managefriend">
      <Friends userId={id} isfriend={true} />
    </div>
  )
}

export default ManageFriend