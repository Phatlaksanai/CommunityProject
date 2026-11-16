import "./transactionStats.scss"
import { useState } from "react";
import { makeAdminRequest } from "../../../api/axios";
import { useQuery, } from "@tanstack/react-query";
import PersonIcon from '@mui/icons-material/Person';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DonutChart from "../../Right/donutChart/donutChart"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TransactionStats = () => {
    const [searchTerm, setSearchTerm] = useState(""); // ค้นชื่อ
    const [filterType, setFilterType] = useState("all"); // กรองประเภทธุรกรรม

    // รวมธุรกรรม (รายได้รวม, ยอดขายรวม, ออเดอร์ทั้งหมด, ออเดอร์วันนี้)
    const { isLoading: summaryLoading, data: summaryData, isError: isSummaryError, } = useQuery({
        queryKey: ["transactionSummary"],
        queryFn: () => {
            return makeAdminRequest.get(`/admin/transactions/transactionSummary`).then(res => res.data); // ผู้ใช้ทั้งหมด
        }
    });

    // ออเดอร์รายสัปดาห์ (Line Chart)
    const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
        queryKey: ["WeeklyOrders"],
        queryFn: () => makeAdminRequest.get(`/admin/transactions/WeeklyOrders`).then(res => res.data) // ผู้ใช้อาทิตนี้
    });

    // ตารางธุรกรรมทั้งหมด
    const { isLoading: ordertableLoading, isError: ordertableError, data: ordertable } = useQuery({
        queryKey: ["getTransactionsTable"],
        queryFn: () => makeAdminRequest.get("/admin/transactions/transactionsTable").then(res => res.data) //ดึงตารางผู้ใช้ทั้งหมด
    });

    // ยอดขายรายสัปดาห์ (Bar Chart)
    const { isLoading: salesChartLoading, data: salesChartData, isError: isSalesChartError } = useQuery({
        queryKey: ["WeeklySales"],
        queryFn: () => makeAdminRequest.get(`/admin/transactions/WeeklySales`).then(res => res.data) //อันบน
    });

    // ช่วงราคาสินค้าที่สั่งซื้อ ( Donut Chart )
    const { isLoading: RangeLoading, isError: RangeError, data: RangeData } = useQuery({
        queryKey: ["OrderByRange"],
        queryFn: () => makeAdminRequest.get("/admin/transactions/OrderByRange").then(res => res.data) //วงล่าง
    });

    // ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบ วัน/เดือน/ปี (เช่น 31/12/2023)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    // ฟังก์ชันเตรียมข้อมูลให้ Donut Chart (กำหนดสีให้กับแต่ละช่วงราคา)
    const formattedRangeData = RangeData?.map((entry) => { //วงล่าง
        let cellColor = "#D9D9D9"; // สีเริ่มต้น
        if (entry.name.includes("฿1–฿100")) cellColor = "#74BD6E"; // ถ้าราคา 1-100 ให้เป็นสีเขียว
        else if (entry.name.includes("฿101–฿500")) cellColor = "#D97773";
        else if (entry.name.includes("฿501+")) cellColor = "#4C8DF5";

        return { ...entry, fill: cellColor }; // คืนค่าข้อมูลเดิม พร้อมเพิ่มคุณสมบัติสี (fill) เข้าไป
    });

    // ฟังก์ชันช่วยใส่ลูกน้ำให้ตัวเลข (เช่น 1000 เป็น 1,000)
    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString();
    };

    // ตัวแปรเก็บข้อมูลตารางที่ผ่านการกรอง (Search & Filter) แล้ว
    const filteredTransactions = ordertable?.filter((transaction) => {
        // เช็คชื่อ Username
        const username = transaction.users?.username || "";
        const matchUsername = username.toLowerCase().includes(searchTerm.toLowerCase());

        // เช็คประเภท
        const matchType = filterType === "all" || transaction.transaction_type === filterType;

        // ต้องตรงทั้ง 2 เงื่อนไขถึงจะแสดงผล
        return matchUsername && matchType;
    }) || [];

    // ฟังก์ชันช่วยตัดคำถ้ายาวเกินไป (ซ่อนตัวเต็มไว้ใน Tooltip)
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

    if (summaryLoading || chartLoading || ordertableLoading || RangeLoading || salesChartLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError || ordertableError || RangeError || isSalesChartError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="transactionstats">
            {/* 4 กล่อง, กราฟเส้น, และตาราง */}
            <div className="L">
                <div className="header-title">
                    <h1>Transactions</h1>
                </div>

                <div className="top-overview-section">
                    {/* 4 กล่อง */}
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

                    <div className="chart-container"
                    >
                        {/* (Line Chart) แสดงออเดอร์รายสัปดาห์ */}
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

                                    {/* แกน Y แสดงจำนวนออเดอร์ */}
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


                <div className="transaction-table-section" style={{ marginTop: '40px' }}>
                    {/* ตารางแสดง ระบบค้นหาและตัวกรอง */}
                    <div className="search-section">
                        <label>Search by Username</label>
                        <div className="filter-controls">
                            {/* ช่องค้นหาด้วย Text */}
                            <div className="search-box">
                                <SearchOutlinedIcon className="icon" />
                                <input
                                    type="text"
                                    placeholder="Search username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* เลือกว่าจะดูธุรกรรมประเภทไหน */}
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
                        {/* ตารางแสดงข้อมูล */}
                        <table>
                            <thead>
                                {/* หัวตาราง */}
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
                                {/* นำข้อมูลที่ผ่านการกรองแล้วมาลูปเพื่อสร้างแถว (tr) ในตาราง */}
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction.transaction_id} className="clickable-row">
                                            <td>{transaction.transaction_id}</td>
                                            {/* renderTruncatedText ตัดคำ */}
                                            <td>{renderTruncatedText(transaction.order_item_id, 10)}</td>
                                            <td>{renderTruncatedText(transaction.users?.username || "null", 10)}</td>
                                            <td>{renderTruncatedText(transaction.amount, 10)}</td>
                                            <td>{renderTruncatedText(transaction.transaction_type, 10)}</td>
                                            <td >{formatDate(transaction.created_at)}</td>
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
                {/* กราฟแท่ง (ยอดขาย) และ กราฟโดนัท (สัดส่วนราคา) */}
                <div className="chart-container">
                    {/* (Bar Chart) แสดงยอดขายรายสัปดาห์ */}
                    <h3 className="chart-title">Weekly Sale</h3>
                    <div style={{ width: "100%", height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesChartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="day_name" // ดึงชื่อวันมาโชว์แกน X
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
                                {/* แท่งกราฟแสดงข้อมูล total_sales */}
                                <Bar dataKey="total_sales" fill="#33A7E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="donut-charts-section">
                    {/* (Donut Chart) แสดงสัดส่วนสินค้าที่ขายได้ แยกตามช่วงราคา */}
                    <div >
                        <DonutChart
                            data={formattedRangeData} // โยนข้อมูลที่เติมสีแล้ว (formattedRangeData) เข้าไป
                            title="Order Distribution by Price Range"
                            tooltipLabel="Items" // หน่วยตอนชี้ (Items : x Items)
                            dataKey="value" // ให้กราฟใช้ Key 'value' ในการคำนวณขนาดของโดนัทแต่ละชิ้น
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

export default TransactionStats