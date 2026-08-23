import "./donutChart.scss"
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

// รับ Props ที่จำเป็นสำหรับการแสดงผลกราฟ
const DonutChart = ({ data, title, tooltipLabel, dataKey = "users" }) => {

    if (!data || data.length === 0) return <div>No data available</div>;

    return (
        <div className="donutChart" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="chart-container">
                <h3 className="chart-title">{title}</h3>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data} // ใช้ข้อมูลที่ถูกแปลงสีมาแล้วจากหน้าหลัก
                                cx="50%"
                                cy="50%"
                                innerRadius={90}
                                outerRadius={130}
                                paddingAngle={5}
                                dataKey={dataKey} // เช่น "users" หรือ "amount" ขึ้นอยู่กับข้อมูล
                                stroke="none"
                            />

                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${Number(value).toLocaleString()} ${tooltipLabel}`, tooltipLabel]}
                            />

                            <Legend
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ color: '#A0AEC0', marginTop: '20px', display: 'flex', justifyContent: 'center' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default DonutChart;