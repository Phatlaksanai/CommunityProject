import "./descItem.scss";
import LeftDI from "../../components/leftDI/leftDI"
import RightDI from "../../components/rightDI/rightDI"
import { useState } from "react";

const DescItem = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    return (
        <div className="descItem">
            <div className="descItemleft">
                <LeftDI />
            </div>

            <div className="descItemright">
                <RightDI />
            </div>
        </div>
    );
}
export default DescItem;