import "./dashboard.scss";
import "dayjs/locale/th";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";

const dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    // Fetch ข้อมูลจาก Backend
    const { isLoading, error, data } = useQuery({
        queryKey: ["dashboardSummary"],
        queryFn: () => {
            return makeRequest.get(`/admin/dashboard/statistics`).then(res => res.data);
        }
    });

    if (isLoading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error">Something went wrong!</div>;

    // ฟังก์ชันช่วยใส่ลูกน้ำ (Comma) ให้ตัวเลข
    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString();
    };

    return (
        <div className="dashboard">
            <div className="container">
                <div className="header-title">
                    <h1>Welcome back, {currentUser?.name || currentUser?.username || "Admin"}</h1>
                    <p>Here’s what’s happening with your marketplace today.</p>
                </div>

                {/* กลุ่มกล่องสรุปข้อมูล */}
                <div className="dashboard-cards">

                    {/* กล่อง 1: Total Revenue */}
                    <div className="summary-card">
                        <div className="card-info">
                            <h3>Total Revenue</h3>
                            <h2>฿ {formatNumber(data?.total_revenue)}</h2>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 20.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* กล่อง 2: Total User */}
                    <div className="summary-card">
                        <div className="card-info">
                            <h3>Total User</h3>
                            <h2>{formatNumber(data?.total_users)}</h2>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 10.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* กล่อง 3: Total Asset */}
                    <div className="summary-card">
                        <div className="card-info">
                            <h3>Total Asset</h3>
                            <h2>{formatNumber(data?.total_assets)}</h2>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 17.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* กล่อง 4: Total Community */}
                    <div className="summary-card">
                        <div className="card-info">
                            <h3>Total Community</h3>
                            <h2>{formatNumber(data?.total_communities)}</h2>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 7.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default dashboard;
