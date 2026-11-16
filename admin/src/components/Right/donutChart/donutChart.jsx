import "./donutChart.scss"
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

// สร้าง Reusable Component ชื่อ DonutChart 
// โดยรับค่าที่ส่งเข้ามาจากหน้าอื่น 4 ตัวเพื่อใช้กำหนดหน้าตาและข้อมูลของกราฟ
const DonutChart = ({ data, title, tooltipLabel, dataKey = "value" }) => {
    // ชุดข้อมูลที่จะนำมาวาดกราฟ (ควรมีค่าสี color กำหนดมาให้แล้วในแต่ละก้อนข้อมูล)
    // ข้อความหัวข้อของกราฟ
    // ข้อความหน่วยที่จะแสดงตอนเอาเมาส์ชี้ที่กราฟ (เช่น "คน", "บาท")
    // ชื่อ Key ใน object ข้อมูลที่เก็บตัวเลขเอาไว้ (ค่าเริ่มต้นคือ "value")
    if (!data || data.length === 0) return <div>No data available</div>; // ถ้าไม่มีข้อมูล

    return (
        <div className="donutChart" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="chart-container">
                <h3 className="chart-title">{title}</h3> {/* แสดงหัวข้อ */}
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">{/* ย่อขยายกราฟตามกล่องครอบ auto */}
                        <PieChart>
                            {/* ตัวเนื้อกราฟโดนัท */}
                            <Pie
                                data={data} // ใช้ข้อมูลที่ถูกแปลงสีมาแล้วจากหน้าหลัก
                                cx="50%" // จุดวางกราฟแกน x (50% กึ่งกลาง)
                                cy="50%" // y (50% กึ่งกลาง)
                                innerRadius={90} // รัสมีรูในกราฟ
                                outerRadius={130} // รัสมีวงนอก (กำหนดความหน้าเส้นกราฟค่าต้องมากกว่ารัสมีรูในกราฟ)
                                paddingAngle={5} // ระยะห่างระหว่างกราฟ
                                dataKey={dataKey} // กำหนดว่าจะให้กราฟดึงตัวเลขจาก Key ไหนมาคำนวณสัดส่วน
                                stroke="none" // ปิดเส้นขอบของตัวกราฟแต่ละชิ้น
                            />

                            {/* กล่องข้อความที่จะเด้งขึ้นมาเวลาเอาเมาส์ไปชี้ที่ชิ้นกราฟ */}
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${Number(value).toLocaleString()} ${tooltipLabel}`, tooltipLabel]}
                            // จัดรูปแบบตัวเลข โดยใส่ลูกน้ำ (toLocaleString) และเอา tooltipLabel มาต่อท้าย เช่น "1,500 คน"
                            />

                            {/* คำอธิบายสัญลักษณ์*/}
                            <Legend
                                height={36} // ความสูงกล่อง
                                iconType="circle" // แสดงเป็นจุดกลม
                                wrapperStyle={{ color: '#A0AEC0', marginTop: '200px', display: 'flex', justifyContent: 'center' }} // (0)
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default DonutChart;