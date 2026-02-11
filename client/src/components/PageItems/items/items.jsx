import Item from "../item/item";
import "./items.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Items = ({ userId }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["items", userId],
    queryFn: () => {
      if (userId) {
        return makeRequest.get(`/items/user/${userId}`).then(res => res.data);
      }
      return makeRequest.get("/items").then(res => res.data);
    }
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="items">
    {data.map((item) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Item item={item} key={item.item_id} />
    ))}
  </div>

};

export default Items;
