import Addfriends from "../../components/PageItems/addfriends/addfriends"
import { useParams } from "react-router-dom";

const ManageAddfriend = () => {
  const { id } = useParams();
  return (
    <div className="friends">
      <Addfriends userId={id}/>
    </div>
  )
}

export default ManageAddfriend