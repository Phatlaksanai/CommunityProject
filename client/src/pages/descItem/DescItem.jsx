import "./descItem.scss";
import LeftDI from "../../components/leftDI/leftDI"
import RightDI from "../../components/rightDI/rightDI"
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DescItem = () => {
    const { id } = useParams(); // id จาก URL
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        if (!id) return;
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/items/${id}`);
                const data = await res.json();
                setItem(data);
            } catch (err) {
                setError("โหลดข้อมูลไม่สำเร็จ");
            }
        };
        fetchItem();
    }, [id]); // ถ้า id เปลี่ยน โหลดข้อมูลใหม่
    if (error) return <div>{error}</div>;
    if (!item) return <div>Loading...</div>;
    return (
        <div className="descItem">
            <div className="descItemleft">
                <LeftDI item={item}/>
            </div>
           
            <div className="descItemright">
                <RightDI item={item}/>
            </div>
        </div>
    );
}
export default DescItem;