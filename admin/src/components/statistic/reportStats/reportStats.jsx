import "./reportStats.scss"
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingIcon from '@mui/icons-material/Pending';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ReportStats = () => {
    const navigate = useNavigate();
    const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";
    const { currentUser, setUser } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ---- State สำหรับ Modal ---- //
    const [selectedReport, setSelectedReport] = useState(null);
    const [formData, setFormData] = useState({ report_id: "", report_type: "", description: "", created_at: "",status: "" });

    const { isLoading: topPostsLoading, isError: topPostsError, data: topPosts } = useQuery({
        queryKey: ["topReportedPosts"],
        queryFn: () => {
            return makeRequest.get("/admin/reports/topPosts").then(res => res.data)
        }
    });

    const { isLoading: topCommunitiesLoading, isError: topCommunitiesError, data: topCommunities } = useQuery({
        queryKey: ["topReportedCommunities"],
        queryFn: () => {
            return makeRequest.get("/admin/reports/topCommunities").then(res => res.data)
        }
    });

    const { isLoading: topReportedUsersLoading, isError: topReportedUsersError, data: topReportedUsers } = useQuery({
        queryKey: ["topReportedUsers"],
        queryFn: () => {
            return makeRequest.get("/admin/reports/topReportedUsers").then(res => res.data)
        }
    });

    const { isLoading: topReportingUsersLoading, isError: topReportingUsersError, data: topReportingUsers } = useQuery({
        queryKey: ["topReportingUsers"],
        queryFn: () => {
            return makeRequest.get("/admin/reports/topReportingUsers").then(res => res.data)
        }
    });

    const { isLoading: reportsLoading, error: reportsError, data: reports } = useQuery({
        queryKey: ["countReports"],
        queryFn: () => makeRequest.get("/admin/reports/countReportsType").then((res) => res.data),
    });

    const { isLoading: reportsTableLoading, isError: reportsTableError, data: reportsTable } = useQuery({
        queryKey: ["getReportsTable"],
        queryFn: () => makeRequest.get("/admin/reports/reportsTable").then(res => res.data)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData) => {
            return makeRequest.put(`/admin/reports/updateReport/${updatedData.report_id}`, { status: updatedData.status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["getReportsTable"]);
            setSelectedReport(null); // ปิด Modal
        },
        onError: (err) => {
            setError("Error updating report: " + err.message);
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
    const filteredReports = reportsTable?.filter((report) => {
        const username = report.actor?.username?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();

        return username.includes(term);
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

    const handleRowClick = (report) => {
        setSelectedReport(report);
        setFormData({
            report_id: report.report_id,
            report_type: report.report_type || "",
            description: report.description || "",
            created_at: report.created_at || "",
            status: report.status || ""
        });
    };

    // ---- ฟังก์ชันจัดการฟอร์มใน Modal ---- //
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = () => {
        updateMutation.mutate(formData);
    };

    // ฟังก์ชัน render กล่อง Top Report แต่ละอัน (Top Posts / Communities / Reported Users / Reporting Users)
    const renderReportBox = (title, data, prefix) => (
        <div className="report-box">
            <div className="report-box-header">
                <h3>{title}</h3>
                <span className="total-label">Total</span>
            </div>
            <div className="report-box-list">
                {data && data.length > 0 ? (
                    data.map((item) => (
                        <div className="report-item" key={`${prefix}-${item.id}`}>
                            <img
                                src={item.image || defaultPic}
                                alt={item.description || prefix}
                                className="report-item-img"
                                onError={(e) => { e.target.src = defaultPic; }}
                            />
                            <div className="report-item-info">
                                <span className="report-item-id">{`#${prefix}-${item.id}`}</span>
                                {(() => {
                                    const displayName = item.description || "-";
                                    const truncatedName = displayName.length > 10 ? `${displayName.substring(0, 10)}...` : displayName;
                                    return (
                                        <div className="report-item-desc">
                                            <span className="custom-tooltip" data-tip={displayName}>
                                                {truncatedName}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                            <span className="report-item-count">{formatNumber(item.report_count)}</span>
                        </div>
                    ))
                ) : (
                    <div className="report-item-empty">No data</div>
                )}
            </div>
        </div>
    );

    if (reportsTableLoading || topPostsLoading || topCommunitiesLoading || topReportedUsersLoading || topReportingUsersLoading || reportsLoading) return <div className="loading">Loading dashboard...</div>;
    if (reportsTableError || topPostsError || topCommunitiesError || topReportedUsersError || topReportingUsersError || reportsError) return <div className="error">Error loading dashboard data.</div>;

    return (
        <div className="reportstats">
            <div className="header-title">
                <h1>Reports</h1>
            </div>

            <div className="top-overview-section">
                <div className="report-boxes-row">
                    {renderReportBox("Top Post Reports", topPosts, "P")}
                    {renderReportBox("Top Community Reports", topCommunities, "C")}
                    {renderReportBox("Top Reported Users", topReportedUsers, "T")}
                    {renderReportBox("Top Reporting Users", topReportingUsers, "A")}
                </div>
            </div>

            <div className="main-content">
                <div className="L">
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

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>report_id</th>
                                        <th>actor</th>
                                        <th>target</th>
                                        <th>item_id</th>
                                        <th>community_id</th>
                                        <th>post_id</th>
                                        <th>description</th>
                                        <th>report_type</th>
                                        <th>status</th>
                                        <th>created_at</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report) => (
                                            <tr key={report.report_id} onClick={() => handleRowClick(report)} className="clickable-row">
                                                <td>{report.report_id}</td>
                                                <td>{renderTruncatedText(report.actor?.username, 10)}</td>
                                                <td>{report.target_id ?? "null"}</td>
                                                <td>{report.item_id ?? "null"}</td>
                                                <td>{report.community_id ?? "null"}</td>
                                                <td>{report.post_id ?? "null"}</td>
                                                <td>{renderTruncatedText(report.description, 10)}</td>
                                                <td>{report.report_type || "null"}</td>
                                                <td>{report.status || "null"}</td>
                                                <td>{formatDate(report.created_at)}</td>
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

                <div className="R">
                    <div className="item">
                        <span className="box-title">Reports</span>
                        <div className="reports-list">
                            <div className="report-item">
                                <div className="report-left">
                                    <FileCopyIcon className="icon" />
                                    <span>CopyRight</span>
                                </div>
                                <span className="report-count">{reports?.copyright || 0}</span>
                            </div>

                            <div className="report-item">
                                <div className="report-left">
                                    <ReportProblemIcon className="icon" />
                                    <span>inappropriate</span>
                                </div>
                                <span className="report-count">{reports?.inappropriate || 0}</span>
                            </div>

                            <div className="report-item">
                                <div className="report-left">
                                    <HighlightOffIcon className="icon" />
                                    <span>spam</span>
                                </div>
                                <span className="report-count">{reports?.spam || 0}</span>
                            </div>

                            <div className="report-item">
                                <div className="report-left">
                                    <ReportGmailerrorredIcon className="icon" />
                                    <span>scam</span>
                                </div>
                                <span className="report-count">{reports?.scam || 0}</span>
                            </div>

                            <div className="report-item">
                                <div className="report-left">
                                    <PendingIcon className="icon" />
                                    <span>Other</span>
                                </div>
                                <span className="report-count">{reports?.other + reports?.technical_issue + reports?.bug + reports?.feedback || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedReport && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Report ID: {selectedReport.report_id}</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Report Type</label>
                                <input type="text" name="report_type" value={formData.report_type} />
                            </div>
                            <div className="input-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    rows="4"
                                    placeholder="description..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Created At</label>
                                <input type="text" name="created_at" value={formatDate(formData.created_at)} />
                            </div>
                            <div className="input-group full-width">
                                <label>Status</label>
                                <div className="select-wrapper">
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="pending">pending</option>
                                        <option value="completed">completed</option>
                                        <option value="cancelled">cancelled</option>
                                    </select>
                                    <ArrowDropDownIcon className="dropdown-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setSelectedReport(null)} disabled={updateMutation.isLoading}>
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

        </div>
    )
}

export default ReportStats