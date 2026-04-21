import Item from "../item/item";
import "./items.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";

const Items = ({ userId, filters ,isProfile}) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["items", userId, filters],
    queryFn: () => {
      const query = new URLSearchParams();

      Object.keys(filters?.category || {}).forEach((key) => {
        if (filters.category[key]) {
          query.append("category", key);
        }
      });

      query.append("date", filters?.date || "AllTime");

      if (userId) {
        return makeRequest
          .get(`/items/user/${userId}?${query.toString()}`)
          .then((res) => res.data);
      }

      return makeRequest
        .get(`/items?${query.toString()}`)
        .then((res) => res.data);
    },
  });

  if (isLoading) return "Loading items...";
  if (error) return "Something went wrong!";

  return <div className="items">
    {data.map((item) => (  // วนลูปแสดงข้อมูลจริงจาก Database
      <Item item={item} key={item.item_id} isProfile={isProfile} />
    ))}
  </div>

};

export default Items;
