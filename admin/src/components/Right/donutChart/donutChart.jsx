import "./donutChart.scss"
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../api/axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DonutChart = ({ isUser }) => {
    const DONUT_COLORS = ["#FF928A", "#8979FF"];
    const { isLoading: userRegistrationsLoading, isError: userRegistrationsError, data: userRegistrations } = useQuery({
        queryKey: ["userRegistrations"],
        queryFn: () => makeRequest.get("/admin/users/userRegistrations").then(res => res.data)
    });

    if (userRegistrationsLoading) return <div>Loading chart...</div>;
    if (userRegistrationsError) return <div>Error loading data.</div>;

    // คำนวณหาปีเพื่อใช้ทำหัวข้อกราฟ
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    return (
        <div className="donutChart">
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
                            {userRegistrations?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                            ))}
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
        </div>
    )
}

export default DonutChart