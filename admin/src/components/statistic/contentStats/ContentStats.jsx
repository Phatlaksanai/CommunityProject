import "./contentStats.scss"
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PersonIcon from '@mui/icons-material/Person';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DonutChart from "../../Right/donutChart/donutChart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ContentStats = () => {
    const navigate = useNavigate();
    const { currentUser, setUser } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [activeTab, setActiveTab] = useState("Posts"); // ตรวจสอบว่าตอนนี้กำลังเลือกแท็บไหนอยู่
    const [isPanelOpen, setIsPanelOpen] = useState(true); // State ควบคุมลูกศรเปิด/ปิด (ค่าเริ่มต้นคือ true = เปิด)

    // ---- State สำหรับ Modal ---- //
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        user_id: "", username: "", name: "", email: "",
        description: "", isdelete: "", role: ""
    });

    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        username: "", email: "", password: "", role: "admin" // บังคับ role เป็น admin ตั้งแต่หน้าบ้าน
    });

    const { isLoading: summaryLoading, data: summaryData, isError: isSummaryError } = useQuery({
        queryKey: ["contentSummary", activeTab], // รีเฟรชเมื่อ activeTab เปลี่ยน
        queryFn: async () => {
            let endpoint = "";

            if (activeTab === "Posts") endpoint = "/admin/content/postSummary";
            else if (activeTab === "Communities") endpoint = "/admin/content/communitySummary";
            else if (activeTab === "Items") endpoint = "/admin/content/itemSummary";

            const res = await makeRequest.get(endpoint);
            return res.data;
        }
    });

    // const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
    //     queryKey: ["weeklyChartData", activeTab],
    //     queryFn: async () => {
    //         let endpoint = "";

    //         if (activeTab === "Posts") endpoint = `/admin/posts/weeklyPosts`;
    //         else if (activeTab === "Communities") endpoint = `/admin/communities/weeklyCommunities`;
    //         else if (activeTab === "Items") endpoint = `/admin/items/weeklyItems`;

    //         return makeRequest.get(endpoint).then(res => res.data);
    //     }
    // });

    // const { isLoading: tableLoading, data: tableData, isError: isTableError } = useQuery({
    //     queryKey: ["contentTable", activeTab],
    //     queryFn: async () => {
    //         let endpoint = "";

    //         if (activeTab === "Posts") endpoint = "/admin/posts/postsTable";
    //         else if (activeTab === "Communities") endpoint = "/admin/communities/communitiesTable";
    //         else if (activeTab === "Items") endpoint = "/admin/items/itemsTable";

    //         const res = await makeRequest.get(endpoint);
    //         return res.data;
    //     }
    // });

    const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
        queryKey: ["weeklyUsers"],
        queryFn: () => makeRequest.get(`/admin/users/WeeklyUsers`).then(res => res.data)
    });

    const { isLoading: usertableLoading, isError: usertableError, data: usertable } = useQuery({
        queryKey: ["getUsersTable"],
        queryFn: () => makeRequest.get("/admin/users/usersTable").then(res => res.data)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData) => {
            return makeRequest.put(`/admin/users/updateUser/${updatedData.user_id}`, updatedData);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getUsersTable"]); // โหลดตารางใหม่หลังอัปเดตเสร็จ
            setSelectedUser(null); // ปิด Modal

            if (currentUser && variables.user_id === currentUser.user_id) { // variables คือข้อมูล formData (เช่น username, name, email) ที่เพิ่งกดส่งไปให้ Backend
                const updatedCurrentUser = {
                    ...currentUser,
                    username: variables.username,
                    name: variables.name
                };

                // อัปเดต Context ทำให้ Navbar เปลี่ยนทันที
                setUser(updatedCurrentUser);

                // อัปเดต LocalStorage ด้วย (อ้างอิงจากตอน Logout ที่คุณใช้ LocalStorage)
                localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
            }
        },
        onError: (err) => {
            setError("Error updating user: " + err.message);
        }
    });

    const addAdminMutation = useMutation({
        mutationFn: (newAdmin) => {
            return makeRequest.post(`/admin/users/addAdmin`, newAdmin);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["getUsersTable"]);
            setIsAddAdminOpen(false); // ปิดหน้าต่าง Add Admin
            setNewAdminData({ username: "", email: "", password: "", role: "admin" }); // เคลียร์ค่า
            setSuccess("Admin added successfully!");
        },
        onError: (err) => {
            if (err.response?.data?.error || err.message) {
                setError(err.response.data.error);
            } else {
                setError("Error adding admin");
            }
        }
    });

    // ฟังก์ชันช่วยใส่ลูกน้ำให้ตัวเลข
    const formatNumber = (num) => {
        return Number(num || 0).toLocaleString();
    };

    // ฟังก์ชันแปลงวันที่
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    // ฟังก์ชันกรองข้อมูลตาม Username
    const filteredUsers = usertable?.filter((user) => {
        if (!user.username) return false;

        return user.username.toLowerCase().includes(searchTerm.toLowerCase());
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

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setFormData({
            user_id: user.user_id,
            username: user.username || "",
            name: user.name || "",
            email: user.email || "",
            description: user.description || "",
            isdelete: user.isdelete || "",
            role: user.role || ""
        });
    };

    // ---- ฟังก์ชันจัดการฟอร์มใน Modal ---- //
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = () => {

        //  แปลงค่าสตริงว่าง "" ให้กลายเป็น null ก่อนส่งไปที่ Backend
        const formattedRole = (!formData.role || formData.role === "NULL") ? null : formData.role;

        const payload = {
            ...formData,
            role: formattedRole
        };


        updateMutation.mutate(payload);
    };

    const handleAddAdminChange = (e) => {
        setNewAdminData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddAdminSubmit = () => {
        if (!newAdminData.email || !newAdminData.username || !newAdminData.password) {
            return setError("Please fill all fields (Email, Username, Password)!");
        }
        addAdminMutation.mutate(newAdminData);
    };

    if (summaryLoading || chartLoading || usertableLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError || usertableError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="contentStats" style={{ display: 'flex' }}>
            <div className="L" style={{ width: isPanelOpen ? '75%' : '100%', transition: 'width 0.3s' }}>
                <div className="container">
                    <div className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                        <div className="header-title">
                            <h1>Content & Assets</h1>
                        </div>
                        {/* กลุ่มปุ่มเลือก Tab */}
                        <div className="tab-buttons">
                            {isPanelOpen && (
                                <>
                                    <button
                                        className={`tab-btn posts-btn ${activeTab === "Posts" ? "active" : ""}`}
                                        onClick={() => setActiveTab("Posts")}
                                    >
                                        Posts
                                    </button>
                                    <button
                                        className={`tab-btn commu-btn ${activeTab === "Communities" ? "active" : ""}`}
                                        onClick={() => setActiveTab("Communities")}
                                    >
                                        Communities
                                    </button>
                                    <button
                                        className={`tab-btn items-btn ${activeTab === "Items" ? "active" : ""}`}
                                        onClick={() => setActiveTab("Items")}
                                    >
                                        Items
                                    </button>
                                </>
                            )}

                            {/* ปุ่มลูกศรเปิด-ปิด */}
                            <div className="toggle-arrow" onClick={() => setIsPanelOpen(!isPanelOpen)}>
                                {isPanelOpen ? <ArrowLeftIcon sx={{ fontSize: 45 }} /> : <ArrowRightIcon sx={{ fontSize: 45 }} />}
                            </div>
                        </div>
                    </div>

                    <div className="top-overview-section">
                        <div className="dashboard-cards">
                            <div className="summary-card">
                                <div className="card-header">
                                    <PersonIcon className="icon" style={{ color: "#163574" }} />
                                    <h3>Total {activeTab}</h3>
                                </div>
                                <div className="card-value">
                                    <h2>{formatNumber(
                                        activeTab === "Posts" ? summaryData?.total_posts : 
                                        activeTab === "Communities" ? summaryData?.total_communities : 
                                        summaryData?.total_items
                                    )}</h2>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-header">
                                    <PersonIcon className="icon" style={{ color: "#3F8336" }} />
                                    <h3>{activeTab} Today</h3>
                                </div>
                                <div className="card-value">
                                    <h2>{formatNumber(
                                        activeTab === "Posts" ? summaryData?.posts_today : 
                                        activeTab === "Communities" ? summaryData?.communities_today : 
                                        summaryData?.items_today
                                    )}</h2>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-header">
                                    <PersonIcon className="icon" style={{ color: "#33A7E5" }} />
                                    <h3>{activeTab} This Month</h3>
                                </div>
                                <div className="card-value">
                                    <h2>{formatNumber(
                                        activeTab === "Posts" ? summaryData?.posts_this_month : 
                                        activeTab === "Communities" ? summaryData?.communities_this_month : 
                                        summaryData?.items_this_month
                                    )}</h2>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="card-header">
                                    <PersonIcon className="icon" style={{ color: "#C66A19" }} />
                                    <h3>{activeTab} This Year</h3>
                                </div>
                                <div className="card-value">
                                    <h2>{formatNumber(
                                        activeTab === "Posts" ? summaryData?.posts_this_year : 
                                        activeTab === "Communities" ? summaryData?.communities_this_year : 
                                        summaryData?.items_this_year
                                    )}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="chart-container">
                            <h3 className="chart-title">Weekly {activeTab}</h3>
                            <div style={{ width: "100%", height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />

                                        <XAxis
                                            dataKey="day_name"
                                            stroke="#A0AEC0"
                                            tick={{ fill: '#A0AEC0', fontSize: 16 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            stroke="#A0AEC0"
                                            tick={{ fill: '#A0AEC0', fontSize: 16 }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />

                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                            itemStyle={{ color: '#E76D09' }}
                                            formatter={(value) => [formatNumber(value), activeTab]}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="total_count"
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
                            <div className="search-box">
                                <SearchOutlinedIcon className="icon" />
                                <input
                                    type="text"
                                    placeholder="Search username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="action-section">
                            <button className="add-admin-btn" onClick={() => setIsAddAdminOpen(true)}>Add Admin</button>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>user_id</th>
                                        <th>username</th>
                                        <th>name</th>
                                        <th>email</th>
                                        <th>description</th>
                                        <th>isdelete</th>
                                        <th>stripe_connect_id</th>
                                        <th>balance</th>
                                        <th>created_at</th>
                                        <th>role</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.user_id} onClick={() => handleRowClick(user)} className="clickable-row">
                                                <td>{user.user_id}</td>
                                                <td>{renderTruncatedText(user.username, 10)}</td>
                                                <td>{renderTruncatedText(user.name, 10)}</td>
                                                <td>{renderTruncatedText(user.email, 10)}</td>
                                                <td >{renderTruncatedText(user.description, 10)}</td>
                                                <td>{user.isdelete || "null"}</td>
                                                <td>{renderTruncatedText(user.stripe_connect_id, 10)}</td>
                                                <td>{renderTruncatedText(
                                                    user.balance !== null ? Number(user.balance).toLocaleString() : "null", 6)}
                                                </td>
                                                <td>{formatDate(user.created_at)}</td>
                                                <td>{user.role || "null"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="no-data">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ฝั่งขวา (R) แสดง DonutChart */}
            {isPanelOpen && (
                <div className="R" style={{ width: '25%', transition: 'width 0.3s' }}>
                    <div className="donut-charts-section">
                        {/* ส่ง activeTab ไปให้ DonutChart เพื่อให้มันรู้ว่าต้องดึงข้อมูลของอะไร */}
                        <DonutChart activeTab={activeTab} />
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit User ID: {selectedUser.user_id}</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="null" />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Role</label>
                                <div className="select-wrapper">
                                    <select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="NULL">NULL</option>
                                        <option value="admin">admin</option>
                                    </select>
                                    <ArrowDropDownIcon className="dropdown-icon" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Is Delete</label>
                                <div className="select-wrapper">
                                    <select name="isdelete" value={formData.isdelete || ""} onChange={handleChange}>
                                        <option value="active">active</option>
                                        <option value="deleted">deleted</option>
                                    </select>
                                    <ArrowDropDownIcon className="dropdown-icon" />
                                </div>
                            </div>
                            <div className="input-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="description..."
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setSelectedUser(null)} disabled={updateMutation.isLoading}>
                                Cancel
                            </button>
                            <button className="btn-update" onClick={handleUpdate} disabled={updateMutation.isLoading}>
                                {updateMutation.isLoading ? "Updating..." : "Update"}
                            </button>
                        </div>
                        {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                        {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                    </div>
                </div>
            )}

            {isAddAdminOpen && (
                <div className="modal-overlay">
                    <div className="modal-content add-admin-modal">
                        <h2>Add Admin</h2>
                        <div className="form-grid add-admin-form">
                            <div className="input-group">
                                <label>Username</label>
                                <input type="text" name="username" value={newAdminData.username} onChange={handleAddAdminChange} placeholder="username" />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" name="email" value={newAdminData.email} onChange={handleAddAdminChange} placeholder="email" />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" name="password" value={newAdminData.password} onChange={handleAddAdminChange} placeholder="password" />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsAddAdminOpen(false)} disabled={addAdminMutation.isLoading}>
                                Cancel
                            </button>
                            <button className="btn-update" onClick={handleAddAdminSubmit} disabled={addAdminMutation.isLoading}>
                                {addAdminMutation.isLoading ? "Adding..." : "Add"}
                            </button>
                        </div>
                        {error && <span style={{ color: "red", margin: "0px 10px" }}>{error}</span>}
                        {success && <span style={{ color: "green", margin: "0px 10px" }}>{success}</span>}
                    </div>
                </div>
            )}

        </div >
    )
}

export default ContentStats