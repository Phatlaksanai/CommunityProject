import Item from "../item/item";
import "./items.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Items = ({ userId, filters ,isProfile, isShop}) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["items", userId, filters],
    queryFn: () => {
      const query = new URLSearchParams();

      if (filters.categories?.length > 0) {
        filters.categories.forEach((id) => {
          query.append("category_id", id);
        });
      }

      query.append("date", filters?.date || "AllTime");
      if (userId) {
        return makeRequest.get(`/items/user/${userId}?${query.toString()}`).then((res) => res.data);
      }

      return makeRequest.get(`/items?${query.toString()}`).then((res) => res.data);
    },
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="items">
    {data.map((item) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Item item={item} key={item.item_id} isProfile={isProfile} isShop={isShop} />
    ))}
  </div>

};

export default Items;
