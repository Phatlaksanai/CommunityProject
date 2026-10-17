import "./descItem.scss";
import LeftDI from "../../components/Left/leftDI/leftDI"
import RightDI from "../../components/Right/rightDI/rightDI"
import { useParams } from "react-router-dom";
import NotFound from "../../components/NotFound/notFound";
import Loading from "../../components/NotFound/loading";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../api/axios";

const DescItem = () => {
    const { id } = useParams();

    // ✅ 1. เปลี่ยนมาใช้ React Query เพื่อการจัดการ State ที่ดีขึ้นและแคชข้อมูลได้
    const { isLoading, error, data: item } = useQuery({
        queryKey: ["item", id],
        queryFn: () => makeRequest.get(`/items/${id}`).then((res) => res.data), // เช็ค Path API ของคุณให้ตรงด้วยนะครับ
        retry: false,
    });

    // ✅ 2. ดักสถานะกำลังโหลด
    if (isLoading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <Loading />
            </div>
        );
    }

    // ✅ 3. ดัก Error หรือหาสินค้าไม่พบ (ถูกลบ/ซ่อน)
    if (error || !item) {
        return (
            <NotFound />
        );
    }

    // ✅ 4. โชว์ข้อมูลเมื่อโหลดสำเร็จ
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