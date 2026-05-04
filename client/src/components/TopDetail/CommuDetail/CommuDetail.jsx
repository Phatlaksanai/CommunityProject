import "./commuDetail.scss";
import { AuthContext } from "../../../context/authContext";
import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import SettingsIcon from '@mui/icons-material/Settings';
import BlockIcon from '@mui/icons-material/Block';
import dayjs from "dayjs";

const CommuDetail = () => {
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  const [community, setCommunity] = useState(null);
  
    useEffect(() => {
      const fetchCommunity = async () => {
        try {
          const res = await makeRequest.get(`communities/${id}`);
          setCommunity(res.data);
        } catch (err) {
          console.error(err);
        }
      };
  
      if (id) {
        fetchCommunity();
      }
    }, [id]);

  return (
    <div className="commudetail">
      <div className="container">
        <div className="cover">
          <img
            src={community?.cover_img|| defaultPic}
            alt="cover"
            className="coverImg"
          />
        </div>
        <div className="profileHeader">
          <div className="profileInfo">
            <div className="nameRow">
              <h1>{community?.name}</h1>
              <div className="actions">
                <SettingsIcon className="settingBtn" onClick={() => navigate(`/editcommu/${community?.communities_id}`)} style={{ cursor: "pointer" }} />
                <BlockIcon className="blockBtn" />
              </div>
            </div>
            <span className="handle">{community?.description}</span>
          </div>
          <p>{dayjs(community?.created_at).format("D MMM YYYY")}</p>
        </div>
      </div>
    </div>
  );
};

export default CommuDetail;