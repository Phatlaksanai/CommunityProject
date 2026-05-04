import "./descCommu.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { makeRequest } from "../../api/axios";
import LeftDC from "../../components/Left/leftDC/leftDC"
import Posts from "../../components/PageItems/posts/posts"

const DescCommu = () => {
    return (
        <div className="descCommu">
            <div className="descCommuleft">
                <LeftDC />
            </div>
           
            <div className="descCommuright">
                <Posts />
            </div>
        </div>
    )
};

export default DescCommu;