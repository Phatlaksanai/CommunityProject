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
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [activeTab, setActiveTab] = useState("Posts"); // ตรวจสอบว่าตอนนี้กำลังเลือกแท็บไหนอยู่
    const [isPanelOpen, setIsPanelOpen] = useState(true); // State ควบคุมลูกศรเปิด/ปิด (ค่าเริ่มต้นคือ true = เปิด)

    // ---- State สำหรับ Modal ---- //
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({});

    // State สำหรับเพิ่ม Category ใหม่
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

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

    const { isLoading: chartLoading, data: chartData, isError: isChartError } = useQuery({
        queryKey: ["weeklyChartData", activeTab],
        queryFn: async () => {
            let endpoint = "";

            if (activeTab === "Posts") endpoint = `/admin/content/weeklyPosts`;
            else if (activeTab === "Communities") endpoint = `/admin/content/weeklyCommunities`;
            else if (activeTab === "Items") endpoint = `/admin/content/weeklyItems`;

            const res = await makeRequest.get(endpoint);

            // กราฟ Recharts ใช้ dataKey="total_count" 
            // จึงต้อง map ชื่อคอลัมน์จาก RPC ให้กลายเป็น total_count
            return res.data.map(item => ({
                day_name: item.day_name,
                total_count: Number(item.post_count || item.community_count || item.item_count || 0)
            }));
        }
    });

    const { isLoading: tableLoading, isError: isTableError, data: tableData } = useQuery({
        queryKey: ["contentTableData", activeTab],
        queryFn: async () => {
            let endpoint = "";
            if (activeTab === "Posts") endpoint = "/admin/content/postsTable";
            else if (activeTab === "Communities") endpoint = "/admin/content/communitiesTable";
            else if (activeTab === "Items") endpoint = "/admin/content/itemsTable";

            const res = await makeRequest.get(endpoint);
            return res.data;
        }
    });

    // ดึงข้อมูล Categories มาทำ Dropdown
    const { data: categoriesData } = useQuery({
        queryKey: ["categoriesList"],
        queryFn: () => makeRequest.get("/admin/content/categories").then(res => res.data)
    });

    const updateMutation = useMutation({
        mutationFn: (updatedData) => {
            // เช็คว่ากำลังแก้ตารางไหนอยู่ แล้วยิง API ให้ถูกเส้น
            let updateEndpoint = "";
            if (activeTab === "Posts") updateEndpoint = `/admin/content/updatePost/${updatedData.id}`;
            else if (activeTab === "Communities") updateEndpoint = `/admin/content/updateCommunity/${updatedData.id}`;
            else if (activeTab === "Items") updateEndpoint = `/admin/content/updateItem/${updatedData.id}`;

            return makeRequest.put(updateEndpoint, updatedData);
        },
        onSuccess: () => {
            // โหลดตารางคอนเทนต์ใหม่หลังอัปเดตเสร็จ
            queryClient.invalidateQueries(["contentTableData", activeTab]);
            setSelectedUser(null); // ปิด Modal
            setSuccess("Updated successfully!");
        },
        onError: (err) => {
            setError("Error updating data: " + err.message);
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

    // ฟังก์ชันกรองข้อมูลแบบครอบคลุม (Search by ID, Username)
    const filteredData = tableData?.filter((item) => {
        if (!searchTerm) return true; // ถ้าช่องค้นหาว่างเปล่า ให้แสดงข้อมูลทั้งหมด

        const term = searchTerm.toLowerCase().trim();

        // หา ID ตาม Tab ปัจจุบัน
        let id = "";
        if (activeTab === "Posts") id = String(item.post_id || "");
        else if (activeTab === "Communities") id = String(item.community_id || "");
        else if (activeTab === "Items") id = String(item.item_id || "");

        // ดึงข้อมูล Username และ Name ของคนที่โพสต์
        const username = item.users?.username || "";

        // เงื่อนไขที่ 1: ค้นหาด้วย ID ตรงเป๊ะ (ขึ้นแค่บรรทัดเดียว)
        if (id === term) {
            return true;
        }

        // เงื่อนไขที่ 2: ค้นหาด้วย Username หรือ Name ของคนโพสต์ (ขึ้นทุกโพสต์ของคนนั้น)
        if (
            username.toLowerCase().includes(term)
        ) {
            return true;
        }

        return false; // ไม่ตรงกับอะไรเลย ให้ซ่อนไป
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

    const handleRowClick = (row) => {
        setSelectedUser(row); // ใช้ selectedUser เป็น State กลางสำหรับเก็บข้อมูลแถวที่ถูกคลิก

        if (activeTab === "Posts") {
            setFormData({
                id: row.post_id,
                status: row.status || "",
                description: row.description || ""
            });
        } else if (activeTab === "Communities") {
            setFormData({
                id: row.communities_id,
                status: row.status || "",
                description: row.description || "",
                cover_img: row.cover_img || ""
            });
        } else if (activeTab === "Items") {
            setFormData({
                id: row.item_id,
                modelName: row.modelName || "",
                description: row.description || "",
                price: row.price || "",
                status: row.status || "",
                category_id: row.category_id || "",
                img: row.img || ""
            });
            setIsAddingNewCategory(false); // เคลียร์ค่าหมวดหมู่ใหม่ เผื่อกดเปิดตัวอื่นต่อ
            setNewCategoryName("");
        }
    };

    // ---- ฟังก์ชันจัดการฟอร์มใน Modal ---- //
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = () => {
        const payload = {
            ...formData,
            new_category_name: isAddingNewCategory ? newCategoryName : null
        };
        
        updateMutation.mutate(payload);
    };

    if (summaryLoading || chartLoading || tableLoading) return <div className="loading">Loading dashboard...</div>;
    if (isSummaryError || isChartError || isTableError) return <div className="error">Error loading dashboard data.</div>;

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
                            <label>Search {activeTab}</label>
                            <div className="search-box">
                                <SearchOutlinedIcon className="icon" />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        {activeTab === "Posts" && (
                                            <>
                                                <th>post_id</th>
                                                <th>username</th>
                                                <th>description</th>
                                                <th>status</th>
                                                <th>community_name</th>
                                                <th>created_at</th>
                                            </>
                                        )}
                                        {activeTab === "Communities" && (
                                            <>
                                                <th>community_id</th>
                                                <th>username</th>
                                                <th>community_name</th>
                                                <th>description</th>
                                                <th>status</th>
                                                <th>cover_img</th>
                                                <th>created_at</th>
                                            </>
                                        )}
                                        {activeTab === "Items" && (
                                            <>
                                                <th>item_id</th>
                                                <th>username</th>
                                                <th>model</th>
                                                <th>img</th>
                                                <th>description</th>
                                                <th>category</th>
                                                <th>model_name</th>
                                                <th>status</th>
                                                <th>price</th>
                                                <th>created_at</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((row) => (
                                            <tr key={row.post_id || row.communities_id || row.item_id} onClick={() => handleRowClick(row)} className="clickable-row">
                                                {activeTab === "Posts" && (
                                                    <>
                                                        <td>{row.post_id}</td>
                                                        <td>{renderTruncatedText(row.users?.username, 15)}</td>
                                                        <td>{renderTruncatedText(row.description, 20)}</td>
                                                        <td>{row.status}</td>
                                                        <td>{renderTruncatedText(row.communities?.name, 15)}</td>
                                                        <td>{formatDate(row.created_at)}</td>
                                                    </>
                                                )}
                                                {activeTab === "Communities" && (
                                                    <>
                                                        <td>{row.communities_id}</td>
                                                        <td>{renderTruncatedText(row.users?.username, 15)}</td>
                                                        <td>{renderTruncatedText(row.name, 15)}</td>
                                                        <td>{renderTruncatedText(row.description, 20)}</td>
                                                        <td>{row.status}</td>
                                                        <td>{renderTruncatedText(row.cover_img, 20)}</td>
                                                        <td>{formatDate(row.created_at)}</td>
                                                    </>
                                                )}
                                                {activeTab === "Items" && (
                                                    <>
                                                        <td>{row.item_id}</td>
                                                        <td>{renderTruncatedText(row.users?.username, 15)}</td>
                                                        <td>{renderTruncatedText(row.model, 20)}</td>
                                                        <td>{renderTruncatedText(row.img, 20)}</td>
                                                        <td>{renderTruncatedText(row.description, 20)}</td>
                                                        <td>{renderTruncatedText(row.categories?.type, 15)}</td>
                                                        <td>{renderTruncatedText(row.modelName, 15)}</td>
                                                        <td>{row.status}</td>
                                                        <td>{row.price}</td>
                                                        <td>{formatDate(row.created_at)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="no-data">No {activeTab.toLowerCase()} found</td>
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
                        <h2>Edit {activeTab === "Communities" ? "Community" : activeTab.slice(0, -1)} ID:{" "}
                            {selectedUser.post_id || selectedUser.communities_id || selectedUser.item_id}</h2>
                        <div className="form-grid">

                            {activeTab === "Posts" && (
                                <>
                                    <div className="input-group">
                                        <label>Status</label>
                                        <div className="select-wrapper">
                                            <select name="status" value={formData.status || ""} onChange={handleChange}>
                                                <option value="show">show</option>
                                                <option value="hide">hide</option>
                                            </select>
                                            <ArrowDropDownIcon className="dropdown-icon" />
                                        </div>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="description..."
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === "Communities" && (
                                <>
                                    <div className="input-group">
                                        <label>Status</label>
                                        <div className="select-wrapper">
                                            <select name="status" value={formData.status || ""} onChange={handleChange}>
                                                <option value="show">show</option>
                                                <option value="hide">hide</option>
                                            </select>
                                            <ArrowDropDownIcon className="dropdown-icon" />
                                        </div>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="description..."
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Cover Image</label>
                                        <input
                                            type="text"
                                            name="cover_img"
                                            value={formData.cover_img || ""}
                                            onChange={handleChange}
                                            placeholder="Paste image URL here..."
                                        />
                                        {/* แสดงตัวอย่างรูป ถ้ามี URL */}
                                        {formData.cover_img && (
                                            <img src={formData.cover_img} alt="Cover Preview" className="cover-preview" style={{ marginTop: '10px', maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab === "Items" && (
                                <>
                                    <div className="input-group">
                                        <label>Model Name</label>
                                        <input type="text" name="modelName" value={formData.modelName || ""} onChange={handleChange} />
                                    </div>
                                    <div className="input-group">
                                        <label>Price</label>
                                        <input type="number" name="price" value={formData.price || ""} onChange={handleChange} />
                                    </div>
                                    <div className="input-group">
                                        <label>Status</label>
                                        <div className="select-wrapper">
                                            <select name="status" value={formData.status || ""} onChange={handleChange}>
                                                <option value="show">show</option>
                                                <option value="hide">hide</option>
                                            </select>
                                            <ArrowDropDownIcon className="dropdown-icon" />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Category</label>
                                        <div className="select-wrapper">
                                            <select
                                                name="category_id"
                                                value={isAddingNewCategory ? "NEW" : (formData.category_id || "")}
                                                onChange={(e) => {
                                                    if (e.target.value === "NEW") {
                                                        setIsAddingNewCategory(true);
                                                    } else {
                                                        setIsAddingNewCategory(false);
                                                        handleChange(e); // อัปเดต formData ปกติ
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>Select Category</option>

                                                {/* วนลูปดึงหมวดหมู่จาก Database มาแสดง */}
                                                {categoriesData?.map((cat) => (
                                                    <option key={cat.category_id} value={cat.category_id}>
                                                        {cat.type}
                                                    </option>
                                                ))}

                                                {/* ตัวเลือกสำหรับสร้างใหม่ */}
                                                <option value="NEW">+ Add New Category...</option>
                                            </select>
                                            <ArrowDropDownIcon className="dropdown-icon" />
                                        </div>
                                    </div>

                                    {/* จะแสดงช่องนี้ ก็ต่อเมื่อเลือก + Add New Category */}
                                    {isAddingNewCategory && (
                                        <div className="input-group full-width">
                                            <label style={{ color: "#33A7E5" }}>New Category Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter new category name..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="input-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="description..."
                                        />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Image URL</label>
                                        <input
                                            type="text"
                                            name="img"
                                            value={formData.img || ""}
                                            onChange={handleChange}
                                            placeholder="Paste image URL here..."
                                        />
                                        {formData.img && (
                                            <img src={formData.img} alt="Item Preview" className="cover-preview" style={{ marginTop: '10px', maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                                        )}
                                    </div>
                                </>
                            )}

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

        </div >
    )
}

export default ContentStats