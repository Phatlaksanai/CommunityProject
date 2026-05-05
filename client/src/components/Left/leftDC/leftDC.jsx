import "./leftDC.scss";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import dayjs from "dayjs";
import ModelViewer from "../../modelViewer/model_viewer";

const LeftDC = ({ project, commuId }) => {
  const navigate = useNavigate();
  const { data: latestImages, error, isLoading } = useQuery({
    queryKey: ["commuImages", commuId],
    queryFn: () => makeRequest.get(`/communities/${commuId}/images`).then(res => res.data)
  });

  if (isLoading) return "Loading...";
  if (error) return "Something went wrong!";

  const defaultPic = "https://scontent.fbkk29-7.fna.fbcdn.net/v/t39.30808-6/686932846_1932050097498236_8935127929054652179_n.jpg?stp=cp6_dst-jpg_s403x403_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e06c5d&_nc_eui2=AeHyu0IxZ1WKmOEK4bLnc-a54oJ8rg4OjmbignyuDg6OZkt4_eD0HDr-RTkwCLoSroVgLLTGDuYCqSuGyuWOAPK-&_nc_ohc=cCn9HpjhbLsQ7kNvwGAdSmW&_nc_oc=AdoVD2YXM3GlnlOnsE7x1kXLlAZZ_rOTC5uLyYvu70vNFQiiwnkc0-agx3rD-gVBmRk&_nc_zt=23&_nc_ht=scontent.fbkk29-7.fna&_nc_gid=HEwj4bhqArLY6R1AD2uSDQ&_nc_ss=7b2a8&oh=00_Af7SlyiIsJBdyTvY8l0tNLHPcgUW4DjbAMPOqSpphSR7Qw&oe=69FF651D";

  return (
    <div className="leftDC">
      <div className="container">
        <div className="item">
          <h2>Gallery</h2>
          <div className="img-container">
            {isLoading ? (
              "Loading..."
            ) : (
              latestImages?.map((imgUrl, index) => (
                <div className="img" key={index}>
                  <img src={imgUrl} alt={`latest-${index}`} />
                </div>
              ))
            )}

            {/* กรณีรูปมีไม่ถึง 4 รูป และต้องการแสดงช่องว่าง/สีน้ำเงินให้เต็ม 4 ช่อง */}
            {!isLoading && latestImages?.length < 4 &&
              Array(4 - latestImages.length).fill(0).map((_, i) => (
                <div className="img empty-slot" key={`empty-${i}`}>
                  <div className="no-image-text">
                    <span>No Image</span>
                  </div>
                </div>
              ))
            }
          </div>
          <button>View All</button>
        </div>
      </div>
    </div>
  );
};


export default LeftDC;
