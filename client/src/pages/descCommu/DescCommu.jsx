import "./descCommu.scss";
import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";
import { AuthContext } from "../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import LeftDC from "../../components/Left/leftDC/leftDC"
import Posts from "../../components/PageItems/posts/posts"
import Share from "../../components/Share/Share";

const DescCommu = () => {
    const { id } = useParams();
    const { currentUser } = useContext(AuthContext);

    // ดึงข้อมูล Community เพื่อเช็คว่าเราเป็นเจ้าของไหม
    const { data: community } = useQuery({
      queryKey: ["community", id],
      queryFn: () => makeRequest.get(`communities/${id}`).then((res) => res.data),
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

    return (
        <div className="descCommu">
            <div className="descCommuleft">
                <LeftDC />
            </div>

            <div className="descCommuright">
                {/* ถ้ามีสิทธิ์โพสต์ ถึงจะให้แสดง Component Share */}
                {canPost && <Share commuId={id} isDescCommu={true}/>}
                <Posts commuId={id} isDescCommu={true}/>
            </div>
        </div>
    )
};

export default DescCommu;