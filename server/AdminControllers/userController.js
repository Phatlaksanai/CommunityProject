const db = require("../config/db");

exports.userRegistrations = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_yearly_user_stats");

    if (error) throw error;

    // หาปีปัจจุบันใน JS เพื่อใช้เป็น Label
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // กำหนดค่าเริ่มต้นเป็น 0 เผื่อไม่มีคนสมัคร
    let usersCurrent = 0;
    let usersPrevious = 0;

    // วนลูปจับคู่ข้อมูล
    data.forEach((row) => {
      if (Number(row.year) === currentYear) usersCurrent = row.total;
      if (Number(row.year) === previousYear) usersPrevious = row.total;
    });

    // 1. หาผลรวม
    const totalUsers = usersCurrent + usersPrevious;

    // 2. คำนวณเปอร์เซ็นต์
    const percentCurrent =
      totalUsers > 0 ? ((usersCurrent / totalUsers) * 100).toFixed(0) : 0;
    const percentPrevious =
      totalUsers > 0 ? ((usersPrevious / totalUsers) * 100).toFixed(0) : 0;

    // 3. จัด Format ข้อความ Name ให้พร้อมแสดงผลเลย
    const formattedData = [
      {
        name: `${currentYear} - ${percentCurrent}% (${usersCurrent})`,
        users: usersCurrent, // ยังต้องส่ง users ไปด้วย เพื่อให้กราฟรู้สัดส่วนชิ้นโดนัท
      },
      {
        name: `${previousYear} - ${percentPrevious}% (${usersPrevious})`,
        users: usersPrevious,
      },
    ];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsersTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("users")
      .select(
        "user_id, username, name, email, description, isdelete, stripe_connect_id, balance, created_at, role",
      )
      .order("user_id", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
    const { userId } = req.params;
    const { username, name, email, description, role, isdelete } = req.body;

    try {
        // 2. ใช้คำสั่งอัปเดตของ Supabase
        const { data, error } = await db
            .from('users')
            .update({ 
                username: username, 
                name: name, 
                email: email, 
                description: description,
                role: role, 
                isdelete: isdelete 
            })
            .eq('user_id', userId)
            .select(); // ใส่ .select() ถ้าต้องการให้ Supabase รีเทิร์นข้อมูลที่อัปเดตแล้วกลับมา

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ message: "User updated successfully", data });
        
    } catch (err) {
        console.error("Update User Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
