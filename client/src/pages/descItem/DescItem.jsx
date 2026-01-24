import "./descItem.scss";
import { useState } from "react";

const DescItem = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    return (
        <div className="descItem">
            <h1>หน้ารายละเอียดสินค้า</h1>
        </div>
    );
}
export default DescItem;