import "./descCommu.scss";
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import LeftDC from "../../components/Left/leftDC/leftDC"
import Posts from "../../components/PageItems/posts/posts"
import Share from "../../components/share/share";
import ScrollToTop from "../../ScrollToTop";
import NotFound from "../../components/NotFound/notFound";
import Loading from "../../components/NotFound/loading";

const DescCommu = () => {
    const { id } = useParams();
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // ดึงข้อมูล Community เพื่อเช็คว่าเราเป็นเจ้าของไหม
    const { data: community, isLoading, error } = useQuery({
        queryKey: ["community", id],
        queryFn: () => makeRequest.get(`communities/${id}`).then((res) => res.data),
        retry: false,
    });

    // ดึงข้อมูลผู้ติดตาม เพื่อเช็คว่าเรา Follow ไหม
    const { data: followers } = useQuery({
        queryKey: ["commuFollowers", id],
        queryFn: () => makeRequest.get(`/communities/followers/${id}`).then((res) => res.data),
    });

    // ✅ ตรวจสอบสิทธิ์
    const isCreator = community?.user_id === currentUser?.user_id;
    const isFollowing = !!followers?.includes(currentUser?.user_id);

    // สามารถโพสต์ได้ ก็ต่อเมื่อ เป็นเจ้าของกลุ่ม หรือ กดติดตามแล้ว
    const canPost = isCreator || isFollowing;

    if (isLoading) {
        return (
            <Loading />
        );
    }

    // ✅ 2. ดักสถานะ "Error หรือ ไม่พบข้อมูล (404)" เป็นอันดับสอง
    if (error) {
        return (
            <NotFound />
        );
    }

    return (
        <div className="descCommu">
            <ScrollToTop />
            <div className="descCommuleft">
                <LeftDC commuId={id} />
            </div>

            <div className="descCommuright">
                {/* ถ้ามีสิทธิ์โพสต์ ถึงจะให้แสดง Component Share */}
                {canPost && <Share commuId={id} isDescCommu={true} />}
                <Posts commuId={id} isDescCommu={true} />
            </div>
        </div>
    )
};

export default DescCommu;