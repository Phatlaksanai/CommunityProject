import "./userStats.scss"
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PeopleIcon from '@mui/icons-material/People';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';

const UserStats = () => {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    // ---- State สำหรับ Modal ---- //
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        user_id: "", username: "", name: "", email: "",
        description: "", isdelete: "", role: ""
    });

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

    const { isLoading: usertableLoading, isError: usertableError, data: usertable } = useQuery({
        queryKey: ["getUsersTable"],
        queryFn: () => makeRequest.get("/admin/users/usersTable").then(res => res.data)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData) => {
            return makeRequest.put(`/admin/users/updateUser/${updatedData.user_id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["getUsersTable"]); // โหลดตารางใหม่หลังอัปเดตเสร็จ
            setSelectedUser(null); // ปิด Modal
        },
        onError: (err) => {
            alert("Error updating user: " + err.message);
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
        updateMutation.mutate(formData);
    };

    if (summaryLoading || chartLoading || usertableLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError || usertableError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="userstats">
            <div className="container">
                <div className="header-title">
                    <h1>Users</h1>
                </div>

                <div className="dashboard-cards">
                    {/* Total Revenue */}
                    <div className="summary-card">
                        <div className="card-info">
                            <PeopleIcon className="icon" style={{ color: "#E76D09" }} />

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
                            <PeopleIcon className="icon" style={{ color: "#163574" }} />

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
                            <PeopleIcon className="icon" style={{ color: "#358E10" }} />

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
                        <button className="add-admin-btn">Add Admin</button>
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

            {/* ---- Modal Pop-up ---- */}
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
                                <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="null" />
                            </div>
                            <div className="input-group">
                                <label>Is Delete</label>
                                <input type="text" name="isdelete" value={formData.isdelete} onChange={handleChange} />
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
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserStats