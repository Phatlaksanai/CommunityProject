const db = require("../config/db");

// ฟังก์ชันกลางสำหรับคำนวณ
const formatDonutYearlyStats = async (rpcName) => {
  const { data, error } = await db.rpc(rpcName);
  if (error) throw error;

  // หาปีปัจจุบันใน JS เพื่อใช้เป็น Label
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // กำหนดค่าเริ่มต้นเป็น 0 เผื่อไม่มีคนโพสต์
  let currentCount = 0;
  let previousCount = 0;

  // วนลูปจับคู่ข้อมูล (ใช้ Number() ครอบ row.total ไว้เผื่อ DB ส่งมาเป็น String)
  data.forEach((row) => {
    if (Number(row.year) === currentYear) currentCount = Number(row.total);
    if (Number(row.year) === previousYear) previousCount = Number(row.total);
  });

  const total = currentCount + previousCount; // หาผลรวม
  const percentCurrent = total > 0 ? ((currentCount / total) * 100).toFixed(0) : 0; // คำนวณเปอร์เซ็นต์
  const percentPrevious = total > 0 ? ((previousCount / total) * 100).toFixed(0) : 0; // คำนวณเปอร์เซ็นต์

  // จัด Format ข้อความ Name ให้พร้อมแสดงผล
  return [
    {
      name: `${currentYear} - ${percentCurrent}% (${currentCount.toLocaleString()})`,
      value: currentCount, // ใช้คำว่า value เพื่อให้หน้าบ้านใช้เป็น dataKey="value" ได้ง่ายๆ
    },
    {
      name: `${previousYear} - ${percentPrevious}% (${previousCount.toLocaleString()})`,
      value: previousCount,
    },
  ];
};

exports.getDonutYearlyPostStats = async (req, res) => {
  try {
    return res.status(200).json(await formatDonutYearlyStats("get_yearly_post_stats"));
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDonutYearlyCommunityStats = async (req, res) => {
  try {
    return res.status(200).json(await formatDonutYearlyStats("get_yearly_community_stats"));
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDonutYearlyItemStats = async (req, res) => {
  try {
    return res.status(200).json(await formatDonutYearlyStats("get_yearly_item_stats"));
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDonutDistributionPost = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_post_media_stats");

    if (error) throw error;

    let imagesCount = 0;
    let modelsCount = 0;

    // วนลูปจับคู่ข้อมูลที่ได้จาก DB
    data.forEach((row) => {
      if (row.category === "Images") imagesCount = Number(row.total);
      if (row.category === "Models") modelsCount = Number(row.total);
    });

    // 1. หาผลรวมทั้งหมด (รูป + โมเดล)
    const totalMedia = imagesCount + modelsCount;

    // 2. คำนวณเปอร์เซ็นต์
    const percentImages = totalMedia > 0 ? ((imagesCount / totalMedia) * 100).toFixed(0) : 0;
    const percentModels = totalMedia > 0 ? ((modelsCount / totalMedia) * 100).toFixed(0) : 0;

    // 3. จัด Format ให้พร้อมใช้งานใน <DonutChart />
    const formattedData = [
      {
        name: `Images - ${percentImages}% (${imagesCount.toLocaleString()})`,
        value: imagesCount,
      },
      {
        name: `3D Models - ${percentModels}% (${modelsCount.toLocaleString()})`,
        value: modelsCount,
      },
    ];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching post media stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDonutDistributionCommunity = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_community_proportion_stats");

    if (error) throw error;

    let joinedCount = 0;
    let notJoinedCount = 0;

    // วนลูปจับคู่ข้อมูล
    data.forEach((row) => {
      if (row.category === "Joined") joinedCount = Number(row.total);
      if (row.category === "Not Joined") notJoinedCount = Number(row.total);
    });

    // 1. หาผลรวม Active Users ทั้งหมด
    const totalActiveUsers = joinedCount + notJoinedCount;

    // 2. คำนวณเปอร์เซ็นต์
    const percentJoined = totalActiveUsers > 0 ? ((joinedCount / totalActiveUsers) * 100).toFixed(0) : 0;
    const percentNotJoined = totalActiveUsers > 0 ? ((notJoinedCount / totalActiveUsers) * 100).toFixed(0) : 0;

    // 3. จัด Format ข้อความ
    const formattedData = [
      {
        name: `Community Members - ${percentJoined}% (${joinedCount.toLocaleString()})`,
        value: joinedCount,
      },
      {
        name: `Non-Members - ${percentNotJoined}% (${notJoinedCount.toLocaleString()})`,
        value: notJoinedCount,
      },
    ];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching community breakdown stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getDonutDistributionItem = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_item_price_stats");

    if (error) throw error;

    let countLow = 0;
    let countMedium = 0;
    let countHigh = 0;

    // วนลูปจับคู่ข้อมูล
    data.forEach((row) => {
      if (row.category === "฿1–฿100") countLow = Number(row.total);
      if (row.category === "฿101–฿500") countMedium = Number(row.total);
      if (row.category === "฿501+") countHigh = Number(row.total);
    });

    // 1. หาผลรวมสินค้าทั้งหมด (นับเฉพาะที่มีราคา 1 บาทขึ้นไป)
    const totalItems = countLow + countMedium + countHigh;

    // 2. คำนวณเปอร์เซ็นต์
    const percentLow = totalItems > 0 ? ((countLow / totalItems) * 100).toFixed(0) : 0;
    const percentMedium = totalItems > 0 ? ((countMedium / totalItems) * 100).toFixed(0) : 0;
    const percentHigh = totalItems > 0 ? ((countHigh / totalItems) * 100).toFixed(0) : 0;

    // 3. จัด Format ข้อความ
    const formattedData = [
      {
        name: `฿1–฿100 - ${percentLow}% (${countLow.toLocaleString()})`,
        value: countLow,
      },
      {
        name: `฿101–฿500 - ${percentMedium}% (${countMedium.toLocaleString()})`,
        value: countMedium,
      },
      {
        name: `฿501+ - ${percentHigh}% (${countHigh.toLocaleString()})`,
        value: countHigh,
      }
    ];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching item price stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_posts_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCommunitySummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_communities_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getItemSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_items_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklyPosts = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_posts_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklyCommunities = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_communities_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly communities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklyItems = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_items_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostsTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("posts")
      .select(
        "post_id, users(username), description, status, communities(name), created_at",
      )
      .order("post_id", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCommunitiesTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("communities")
      .select(
        "communities_id, users(username), description, status, name, cover_img, created_at",
      )
      .order("communities_id", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getItemsTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("items")
      .select(
        "item_id, users(username), model, modelName, img, description, category_id, categories(type), status, price, created_at",
      )
      .order("item_id", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const { status, description } = req.body;

  try {
    // 2. ใช้คำสั่งอัปเดตของ Supabase
    const { data, error } = await db
      .from("posts")
      .update({
        status: status,
        description: description,
      })
      .eq("post_id", postId)
      .select(); // ใส่ .select() ถ้าต้องการให้ Supabase รีเทิร์นข้อมูลที่อัปเดตแล้วกลับมา

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Post updated successfully", data });
  } catch (err) {
    console.error("Update Post Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateCommunity = async (req, res) => {
  const { communityId } = req.params;
  const { status, description, cover_img } = req.body;

  try {
    const { data, error } = await db
      .from("communities")
      .update({
        status: status,
        description: description,
        cover_img: cover_img,
      })
      .eq("communities_id", communityId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res
      .status(200)
      .json({ message: "Community updated successfully", data });
  } catch (err) {
    console.error("Update Community Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateItem = async (req, res) => {
  const { itemId } = req.params;
  const { modelName, description, price, status, category_id, new_category_name, img } = req.body;

  try {
    let finalCategoryId = category_id;

    // ถ้าแอดมินพิมพ์หมวดหมู่ใหม่มา ให้ INSERT ลงตาราง categories ก่อน
    if (new_category_name) {
      const { data: newCat, error: insertErr } = await db
        .from("categories")
        .insert([{ type: new_category_name }])
        .select("category_id")
        .single(); // ดึง id ที่เพิ่งสร้างกลับมา

      if (insertErr) throw insertErr;
      finalCategoryId = newCat.category_id;
    }

    // อัปเดต Item ด้วย finalCategoryId
    const { data, error } = await db
      .from("items")
      .update({
        modelName: modelName,
        description: description,
        price: price,
        status: status,
        img: img,
        category_id: finalCategoryId 
      })
      .eq("item_id", itemId)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Item updated", data });
  } catch (err) {
    console.error("Update Item Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCategories = async (req, res) => { // เพิ่มฟังก์ชันดึง Category ทั้งหมดไปแสดงที่ Dropdown หน้าบ้าน
  try {
    const { data, error } = await db
    .from("categories")
    .select("*");

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};