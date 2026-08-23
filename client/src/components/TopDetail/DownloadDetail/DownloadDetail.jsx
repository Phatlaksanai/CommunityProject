import "./downloadDetail.scss";
import { NavLink, useParams } from "react-router-dom";

const DownloadDetail = () => {
    const { id } = useParams();

    return (
        <div className="downloadDetail">
            <div className="container">
                <div className="Header">
                    <h1>My Account</h1>
                    <div className="btntabs">
                        <NavLink to={`/download/${id}`} end>Downloads</NavLink>
                        <NavLink to={`/download/${id}/transection`}>Transection</NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DownloadDetail;