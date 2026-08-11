import "./dashboard.scss";
import "dayjs/locale/th";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery } from "@tanstack/react-query";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    const { isLoading: summaryLoading, data: summaryData, isError: isSummaryError, } = useQuery({
        queryKey: ["dashboardSummary"],
        queryFn: () => {
            return makeRequest.get(`/admin/dashboard/statistics`).then(res => res.data);
        }
    });

    const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
        queryKey: ["weeklySales"],
        queryFn: () => makeRequest.get(`/admin/dashboard/revenueOverview`).then(res => res.data)
    });

    // ฟังก์ชันช่วยใส่ลูกน้ำ (Comma) ให้ตัวเลข
    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString();
    };

    if (summaryLoading || chartLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="dashboard">
            <div className="container">
                <div className="header-title">
                    <h1>Welcome back, {currentUser?.name || currentUser?.username || "Admin"}</h1>
                    <p>Here’s what’s happening with your marketplace today.</p>
                </div>

                {/* กลุ่มกล่องสรุปข้อมูล */}
                <div className="dashboard-cards">
                    {/* Total Revenue */}
                    <div className="summary-card">
                        <div className="card-info">
                            <PaidIcon className="icon" style={{ color: "#E76D09" }} />

                            <div className="text-info">
                                <h3>Total Revenue</h3>
                                <h2>฿ {formatNumber(summaryData?.total_revenue)}</h2>
                            </div>
                        </div>

                        <div className="card-footer">
                            <span className="trend up">▲ 20.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* Total User */}
                    <div className="summary-card">
                        <div className="card-info">
                            <PersonIcon className="icon" style={{ color: "#163574" }} />

                            <div className="text-info">
                                <h3>Total User</h3>
                                <h2>{formatNumber(summaryData?.total_users)}</h2>
                            </div>
                        </div>

                        <div className="card-footer">
                            <span className="trend up">▲ 10.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* Total Asset */}
                    <div className="summary-card">
                        <div className="card-info">
                            <ViewInArIcon className="icon" style={{ color: "#358E10" }} />

                            <div className="text-info">
                                <h3>Total Asset</h3>
                                <h2>{formatNumber(summaryData?.total_assets)}</h2>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 17.2%</span> vs May 13 - May 19
                        </div>
                    </div>

                    {/* Total Community */}
                    <div className="summary-card">
                        <div className="card-info">
                            <PeopleIcon className="icon" style={{ color: "#E76D09" }} />

                            <div className="text-info">
                                <h3>Total Community</h3>
                                <h2>{formatNumber(summaryData?.total_communities)}</h2>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="trend up">▲ 7.2%</span> vs May 13 - May 19
                        </div>
                    </div>
                </div>

                {/* กราฟ Revenue Overview */}
                <div className="chart-container">
                    <h3 className="chart-title">Revenue Overview</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                {/* เส้นตารางพื้นหลังแบบจางๆ */}
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

                                {/* แกน X แสดงวันที่ */}
                                <XAxis
                                    dataKey="sale_date"
                                    stroke="#A0AEC0"
                                    tick={{ fill: '#A0AEC0', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                {/* แกน Y แสดงยอดเงิน */}
                                <YAxis
                                    stroke="#A0AEC0"
                                    tick={{ fill: '#A0AEC0', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />

                                {/* กล่องข้อความเมื่อเอาเมาส์ชี้ */}
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#F6AD55' }}
                                    formatter={(value) => [`฿ ${formatNumber(value)}`, "Revenue"]}
                                />

                                {/* เส้นกราฟ */}
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#F6AD55"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#F6AD55", strokeWidth: 2, stroke: "#13151A" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
