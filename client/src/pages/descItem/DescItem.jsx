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

    const { isLoading, error, data: item } = useQuery({
        queryKey: ["item", id],
        queryFn: () => makeRequest.get(`/items/${id}`).then((res) => res.data),
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="loading-container" style={{ minHeight: "100vh" }}>
                <Loading />
            </div>
        );
    }

    if (error || !item) {
        return (
            <NotFound />
        );
    }

    return (
        <div className="descItem">
            <div className="descItemleft">
                <LeftDI item={item} />
            </div>

            <div className="descItemright">
                <RightDI item={item} />
            </div>
        </div>
    );
}

export default DescItem;