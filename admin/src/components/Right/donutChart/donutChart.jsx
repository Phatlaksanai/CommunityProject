import "./donutChart.scss"
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DonutChart = ({ isUser }) => {

    const { isLoading: userRegistrationsLoading, isError: userRegistrationsError, data: userRegistrations } = useQuery({
        queryKey: ["userRegistrations"],
        queryFn: () => makeRequest.get("/admin/users/userRegistrations").then(res => res.data)
    });

    const { isLoading: roleLoading, isError: roleError, data: roleData } = useQuery({
        queryKey: ["userRolesProportion"],
        queryFn: () => makeRequest.get("/admin/users/RoleUsers").then(res => res.data)
    });

    if (userRegistrationsLoading || roleLoading) return <div>Loading chart...</div>;
    if (userRegistrationsError || roleError) return <div>Error loading data.</div>;

    // คำนวณหาปีเพื่อใช้ทำหัวข้อกราฟ
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    return (
        <div className="donutChart" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="chart-container">
                <h3 className="chart-title">User Registrations: {previousYear} vs {currentYear}</h3>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={userRegistrations}
                                cx="50%"
                                cy="50%"
                                innerRadius={90}
                                outerRadius={130}
                                paddingAngle={5}
                                dataKey="users"
                                stroke="none"
                            >
                                {userRegistrations?.map((entry, index) => {
                                    let cellColor = "#D9D9D9"; // สีเทาเป็นสีพื้นฐาน

                                    // เช็คว่าชื่อมีตัวเลขปีปัจจุบัน (เช่น 2026) หรือปีก่อนหน้า (เช่น 2025)
                                    if (entry.name.includes(currentYear.toString())) cellColor = "#FF928A";
                                    else if (entry.name.includes(previousYear.toString())) cellColor = "#8979FF";
                                    
                                    return <Cell key={`cell-${index}`} fill={cellColor} />;
                                })}
                            </Pie>

                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${Number(value).toLocaleString()} Users`, "Registered"]}
                            />

                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ color: '#A0AEC0', marginTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-container">
                <h3 className="chart-title">User Roles Proportion</h3>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={90}
                                outerRadius={130}
                                paddingAngle={5}
                                dataKey="users"
                                stroke="none"
                            >
                                {roleData?.map((entry, index) => {
                                    // เช็คว่าในข้อความ name (เช่น "User - 60% (6)") มีคำว่าอะไรอยู่ แล้วดึงสีนั้นมาใช้
                                    let cellColor = "#D9D9D9"; // สีเริ่มต้น
                                    if (entry.name.includes("User")) cellColor = "#FF928A";
                                    else if (entry.name.includes("Seller")) cellColor = "#D9D9D9";
                                    else if (entry.name.includes("Admin")) cellColor = "#74BD6E";

                                    return <Cell key={`cell-${index}`} fill={cellColor} />;
                                })}
                            </Pie>

                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${Number(value).toLocaleString()} Users`, "Total"]}
                            />

                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ color: '#A0AEC0', marginTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default DonutChart