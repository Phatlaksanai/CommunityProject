import { useParams } from "react-router-dom";
import Items from "../../components/PageItems/items/items";

const ProfileItems = () => {
  const { id } = useParams(); 
  return (
    <div className="profile">
      <Items userId={id} />
    </div>
  );
};

export default ProfileItems;
