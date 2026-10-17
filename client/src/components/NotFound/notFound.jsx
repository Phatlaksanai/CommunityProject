import "./notFound.scss";
import { useNavigate } from "react-router-dom";
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found">
            <SearchOffIcon style={{ fontSize: "100px", color: "#3F5428" }} />
            <h2>Not found</h2>
            <p>The page or content you are looking for may have been deleted, hidden, or does not exist.</p>
            <button onClick={() => navigate("/")}>
                Back to Home
            </button>
        </div>
    );
};

export default NotFound;