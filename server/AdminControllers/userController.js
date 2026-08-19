const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getuserRegistrations = async (req, res) => {
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

exports.getUserRolesProportion = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_user_roles_proportion");

    if (error) throw error;

    // 1. กำหนดค่าเริ่มต้นเป็น 0 ไว้ก่อน (เพื่อรับประกันว่ากราฟจะได้รับข้อมูลครบทั้ง 3 กลุ่มเสมอ แม้กลุ่มนั้นจะยังไม่มีคน)
    const rolesCount = {
      User: 0,
      Seller: 0,
      Admin: 0,
    };

    // 2. วนลูปเอาข้อมูลที่ได้จาก Database มาอัปเดตทับค่าเริ่มต้น
    if (data && data.length > 0) {
      data.forEach((row) => {
        if (rolesCount[row.role_name] !== undefined) {
          rolesCount[row.role_name] = Number(row.total);
        }
      });
    }

    // 3. หาผลรวมของผู้ใช้ทั้งหมด
    const totalUsers = rolesCount.User + rolesCount.Seller + rolesCount.Admin;

    // 4. จัด Format ให้เป็น Array ตามที่หน้าบ้านต้องการ
    const formattedData = Object.keys(rolesCount).map((role) => {
      const count = rolesCount[role];

      // คำนวณเปอร์เซ็นต์ (ดักจับกรณี totalUsers เป็น 0 เพื่อไม่ให้เกิด Error หารด้วยศูนย์)
      const percent =
        totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(0) : 0;

      return {
        name: `${role} - ${percent}% (${count})`, // เช่น "User - 80% (400)"
        users: count, // ส่งตัวเลขจำนวนคนแยกไปด้วย เพื่อให้ Recharts รู้สัดส่วนชิ้นโดนัท
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching user roles proportion:", error);
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
      .from("users")
      .update({
        username: username,
        name: name,
        email: email,
        description: description,
        role: role,
        isdelete: isdelete,
      })
      .eq("user_id", userId)
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

exports.getUserSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_users_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklyUsers = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_users_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addAdmin = async (req, res) => {
  let { username, email, password, role } = req.body;

  try {
    username = username.trim();
    if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9_ ]+$/.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
    }

    if (username.length < 3 || username.length > 35) {
      return res.status(400).json({ error: "Username must be between 3 and 35 characters" });
    }

    if (password.length < 10 || password.length > 20) {
      return res.status(400).json({ error: "Password must be between 10 and 20 characters" });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, and one special character" });
    }

    let hashedPassword = await bcrypt.hash(password, 8);

    const { data, error } = await db.from("users").insert([
      {
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
      },
    ]);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Admin added successfully", data });
  } catch (err) {
    console.error("Add Admin Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
