import { useParams } from "react-router-dom";
import Items from "../../components/PageItems/items/items";
import ScrollToTop from "../../ScrollToTop";

const ProfileItems = () => {
  const { id } = useParams(); 
  const defaultFilters = { // กำหนดค่าเริ่มต้นของ filters ส่งไปยัง Items component
    categories: [],
    date: "AllTime",
  };

  return (
    <div className="profile">
      <ScrollToTop />
      <Items userId={id} isProfile={true} filters={defaultFilters}/>
    </div>
  );
};

export default ProfileItems;
