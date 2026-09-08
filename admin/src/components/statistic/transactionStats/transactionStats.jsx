import "./transactionStats.scss"
import { useState } from "react";
import { makeRequest } from "../../../api/axios";
import { useQuery, } from "@tanstack/react-query";
import PersonIcon from '@mui/icons-material/Person';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DonutChart from "../../Right/donutChart/donutChart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TransactionStats = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");


    const { isLoading: summaryLoading, data: summaryData, isError: isSummaryError, } = useQuery({
        queryKey: ["transactionSummary"],
        queryFn: () => {
            return makeRequest.get(`/admin/transactions/transactionSummary`).then(res => res.data); // ผู้ใช้ทั้งหมด ✅
        }
    });

    const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
        queryKey: ["WeeklyOrders"],
        queryFn: () => makeRequest.get(`/admin/transactions/WeeklyOrders`).then(res => res.data) // ผู้ใช้อาทิตนี้ ✅
    });

    const { isLoading: ordertableLoading, isError: ordertableError, data: ordertable } = useQuery({
        queryKey: ["getTransactionsTable"],
        queryFn: () => makeRequest.get("/admin/transactions/transactionsTable").then(res => res.data) //ดึงตารางผู้ใช้ทั้งหมด
    });

    const { isLoading: salesChartLoading, data: salesChartData, isError: isSalesChartError } = useQuery({
        queryKey: ["WeeklySales"],
        queryFn: () => makeRequest.get(`/admin/transactions/WeeklySales`).then(res => res.data) //อันบน
    });

    const { isLoading: RangeLoading, isError: RangeError, data: RangeData } = useQuery({
        queryKey: ["OrderByRange"],
        queryFn: () => makeRequest.get("/admin/transactions/OrderByRange").then(res => res.data) //วงล่าง
    });

    const formattedRangeData = RangeData?.map((entry) => { //วงล่าง
        let cellColor = "#D9D9D9";
        if (entry.name.includes("฿1–฿100")) cellColor = "#74BD6E";
        else if (entry.name.includes("฿101–฿500")) cellColor = "#D97773";
        else if (entry.name.includes("฿501+")) cellColor = "#4C8DF5";

        // เอา users: ... ออก เหลือแค่นี้พอครับ
        return { ...entry, fill: cellColor };
    });

    // ฟังก์ชันช่วยใส่ลูกน้ำให้ตัวเลข
    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString();
    };

    const filteredTransactions = ordertable?.filter((transaction) => {
        // เงื่อนไขที่ 1: เช็คชื่อ Username
        const username = transaction.users?.username || "";
        const matchUsername = username.toLowerCase().includes(searchTerm.toLowerCase());

        // เงื่อนไขที่ 2: เช็คประเภท
        const matchType = filterType === "all" || transaction.transaction_type === filterType;

        // ต้องตรงทั้ง 2 เงื่อนไขถึงจะแสดงผล
        return matchUsername && matchType;
    }) || [];

    // ฟังก์ชันช่วยตัดคำและใส่ Tooltip
    const renderTruncatedText = (text, maxLength = 10) => {
        if (!text) return "null";

        return (
            <span className="custom-tooltip" data-tip={text}>
                {text.length > maxLength
                    ? `${text.substring(0, maxLength)}...`
                    : text}
            </span>
        );
    };

    if (summaryLoading || chartLoading || ordertableLoading || RangeLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError || ordertableError || RangeError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="transactionstats">
            <div className="L">
                <div className="header-title">
                    <h1>Transactions</h1>
                </div>

                <div className="top-overview-section">
                    <div className="dashboard-cards">
                        <div className="summary-card">
                            <div className="card-header">
                                <PersonIcon className="icon" style={{ color: "#163574" }} />
                                <h3>Total Revenue</h3>
                            </div>
                            <div className="card-value">
                                <h2>{formatNumber(summaryData?.total_revenue)}</h2>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-header">
                                <PersonIcon className="icon" style={{ color: "#3F8336" }} />
                                <h3>Total Sales</h3>
                            </div>
                            <div className="card-value">
                                <h2>{formatNumber(summaryData?.total_sales)}</h2>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-header">
                                <PersonIcon className="icon" style={{ color: "#33A7E5" }} />
                                <h3>Total Orders</h3>
                            </div>
                            <div className="card-value">
                                <h2>{formatNumber(summaryData?.total_order)}</h2>
                            </div>
                        </div>

                        <div className="summary-card">
                            <div className="card-header">
                                <PersonIcon className="icon" style={{ color: "#C66A19" }} />
                                <h3>Orders Today</h3>
                            </div>
                            <div className="card-value">
                                <h2>{formatNumber(summaryData?.order_today)}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3 className="chart-title">Weekly Orders</h3>
                        <div style={{ width: "100%", height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    {/* เส้นตารางพื้นหลังแบบแนวนอน */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

                                    {/* แกน X แสดงชื่อวัน (day_name จาก SQL) */}
                                    <XAxis
                                        dataKey="day_name"
                                        stroke="#A0AEC0"
                                        tick={{ fill: '#A0AEC0', fontSize: 16 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    {/* แกน Y แสดงจำนวนผู้ใช้ (user_count จาก SQL) */}
                                    <YAxis
                                        stroke="#A0AEC0"
                                        tick={{ fill: '#A0AEC0', fontSize: 16 }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false} /* บังคับไม่ให้แกน Y แสดงจุดทศนิยม เพราะจำนวนคนต้องเป็นจำนวนเต็ม */
                                    />

                                    {/* กล่องข้อความเมื่อเอาเมาส์ชี้ */}
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ color: '#E76D09' }}
                                        formatter={(value) => [formatNumber(value), "Orders"]}
                                    />

                                    {/* เส้นกราฟ */}
                                    <Line
                                        type="monotone"
                                        dataKey="order_count"
                                        stroke="#E76D09"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#E76D09", strokeWidth: 2, stroke: "#13151A" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>



                <div className="user-table-section" style={{ marginTop: '40px' }}>

                    <div className="search-section">
                        <label>Search by Username</label>
                        <div className="filter-controls">
                            <div className="search-box">
                                <SearchOutlinedIcon className="icon" />
                                <input
                                    type="text"
                                    placeholder="Search username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="select-wrapper">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="sale">sale</option>
                                    <option value="withdrawal">withdrawal</option>
                                </select>
                                <ArrowDropDownIcon className="dropdown-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>transaction_id</th>
                                    <th>order_item_id</th>
                                    <th>username</th>
                                    <th>amount</th>
                                    <th>transaction_type</th>
                                    <th>created_at</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction.transaction_id} className="clickable-row">
                                            <td>{transaction.transaction_id}</td>
                                            <td>{renderTruncatedText(transaction.order_item_id, 10)}</td>
                                            <td>{renderTruncatedText(transaction.users?.username || "null", 10)}</td>
                                            <td>{renderTruncatedText(transaction.amount, 10)}</td>
                                            <td>{renderTruncatedText(transaction.transaction_type, 10)}</td>
                                            <td >{renderTruncatedText(transaction.created_at, 10)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="no-data">No transactions found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="R">
                <div className="chart-container">
                    <h3 className="chart-title">Weekly Sale</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesChartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="day_name"
                                    stroke="#A0AEC0"
                                    tick={{ fill: '#A0AEC0', fontSize: 14 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#A0AEC0"
                                    tick={{ fill: '#A0AEC0', fontSize: 14 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#33A7E5' }}
                                    formatter={(value) => [formatNumber(value), "Sales (฿)"]}
                                />
                                {/* ปรับสีแท่งกราฟให้ตรงกับ figma (สีฟ้า) */}
                                <Bar dataKey="total_sales" fill="#33A7E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="donut-charts-section">

                    <div >
                        <DonutChart
                            data={formattedRangeData}
                            title="Order Distribution by Price Range"
                            tooltipLabel="Items"
                            dataKey="value"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default TransactionStats