import "./friendDetail.scss";
import { NavLink, useParams } from "react-router-dom";

const FriendDetail = () => {
    const { id } = useParams();

    return (
        <div className="frienddetail">
            <div className="container">
                <div className="Header">
                    <h1>Manage Friends</h1>
                    <div className="btntabs">
                        <NavLink to={`/managefriends/${id}`} end>Friends</NavLink>
                        <NavLink to={`/managefriends/${id}/addfriend`}>Add Friend</NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendDetail;