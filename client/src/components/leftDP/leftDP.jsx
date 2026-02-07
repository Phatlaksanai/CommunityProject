import "./leftDP.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";
import dayjs from "dayjs";
import "dayjs/locale/th";

const LeftDP = ({ project }) => {
  const { isLoading, error , data} = useQuery({
    queryKey: ["items", project],
    enabled: !!project, 
    queryFn: () => {
      if (project) {
        return makeRequest.get(`/items/project/${project}`).then(res => res.data);
      }
    }
  });

  if (isLoading) return "Loading...";

  if (error) return "Something went wrong!";

  return (
    <div className="leftDP">
      <div className="container">
        {data && data.map((item) => (
          <div className="item" key={item.item_id}>
            <div className="top">
              <div className="L">
                <h2>{item.modelName}</h2>
                <img src={item.img} alt=""/>
              </div>
              <div className="R">
                <p>Discription : {item.description}</p>
                <p>Price : {item.price}</p>
                <span>Created At : {dayjs(item?.createAt).locale("th").format("D MMM YYYY")}</span>
              </div>
            </div>
          </div>
        ))}
        {data && data.map((post) => (
        <div className="item">
          <h2>สถิติ</h2>
          <p>ระยะเวลาการพัฒนา</p>
          <p>first post : {dayjs(post?.start_date).locale("th").format("D MMM YYYY")}</p>
          <p>last post : {dayjs(post?.end_date).locale("th").format("D MMM YYYY")}</p>
          <p>duration : {dayjs(post?.end_date).diff(dayjs(post?.start_date), "day")} วัน</p>
          <p>all posts : {data.length} ชิ้น</p>
          <p>last updated : {dayjs(post?.updated_at).locale("th").format("D MMM YYYY")}</p>
        </div>
        ))}
      </div>
    </div>
  );
};

export default LeftDP;
