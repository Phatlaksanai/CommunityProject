import Addfriends from "../../components/PageItems/addfriends/addfriends"
import ScrollToTop from "../../ScrollToTop";
import { useParams } from "react-router-dom";

const ManageAddfriend = () => {
  const { id } = useParams();
  return (
    <div className="managefriend">
      <ScrollToTop />
      <Addfriends userId={id}/>
    </div>
  )
}

export default ManageAddfriend