import "./users.scss";
import "dayjs/locale/th";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";

const Item = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    // const { isLoading, error, data = [] } = useQuery({
    //     queryKey: ["todayUsers", userId],
    //     queryFn: () => {
    //         return makeRequest.get(`/statistics/user`).then(res => res.data);
    //     }
    // });

    // if (isLoading) return "Loading items...";
    // if (error) return "Something went wrong!";

    useEffect(() => {

    }, []);

    return (
        <div className="users">
            <div className="container">
                <div className="content">
                    <img src="https://placehold.co/600x400?text=Image+Error" alt="" />

                    <div className="desc">
                        <p>hina</p>
                    </div>
                    <div className="price">
                        <p>$ 10</p>
                    </div>
                </div>

                <div className="content">
                    <img src="https://placehold.co/600x400?text=Image+Error" alt="" />

                    <div className="desc">
                        <p>hina</p>
                    </div>
                    <div className="price">
                        <p>$ 10</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Item;
