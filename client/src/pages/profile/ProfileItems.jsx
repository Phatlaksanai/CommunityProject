import { useParams } from "react-router-dom";
import Items from "../../components/PageItems/items/items";
import ScrollToTop from "../../ScrollToTop";

const ProfileItems = () => {
  const { id } = useParams(); 
  return (
    <div className="profile">
      <ScrollToTop />
      <Items userId={id} isProfile={true}/>
    </div>
  );
};

export default ProfileItems;
