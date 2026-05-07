import Friends from "../../components/PageItems/friends/friends"
import { useParams } from "react-router-dom";
import "./manageFriend.scss"

const ManageFriend = () => {
  const { id } = useParams();
  return (
    <div className="friends">
      <Friends userId={id}/>
    </div>
  )
}

export default ManageFriend