import "./descCommu.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";
import LeftDC from "../../components/Left/leftDC/leftDC"
import Posts from "../../components/PageItems/posts/posts"
import Share from "../../components/Share/Share";

const DescCommu = () => {
    const { id } = useParams();
    return (
        <div className="descCommu">
            <div className="descCommuleft">
                <LeftDC />
            </div>

            <div className="descCommuright">
                <Share commuId={id} isDescCommu={true}/>
                <Posts commuId={id} isDescCommu={true}/>
            </div>
        </div>
    )
};

export default DescCommu;