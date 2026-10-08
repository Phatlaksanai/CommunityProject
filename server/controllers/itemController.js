const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require("../config/algolia");

exports.getItems = async (req, res) => {
  try {
    const { category_id, date, user_id } = req.query;

    // รับค่า page จาก Frontend, กำหนด default เป็น 0
    const page = parseInt(req.query.page) || 0;
    const limit = 15; // จำนวนสินค้าที่ต้องการส่งกลับไปให้ Frontend
    let fetchSize = 20; // ดึงมาตรวจทีละ 20 เพื่อความรวดเร็วเผื่อมีข้อมูลโดนกรองทิ้ง
    let currentOffset = page * limit;
    let finalItems = [];

    // วนลูปดึงข้อมูลจนกว่าจะได้ครบ 15 ชิ้น หรือหมดฐานข้อมูล
    while (finalItems.length < limit) {
      let query = db.from("items")
        .select(`*,
          categories(
            category_id,
            type
          )`
        )
        .order("item_id", { ascending: false });

      if (user_id) {
        query = query.neq("user_id", user_id);
      }

      // ✅ filter category
      if (category_id) {
        const categoryIds = Array.isArray(category_id)
          ? category_id
          : [category_id];
        query = query.in("category_id", categoryIds);
      }

      // ✅ filter date
      let itemIdsFromDateFilter = null;
      if (date && date !== "AllTime") {
        const now = new Date();
        let pastDate = new Date();

        if (date === "ThisMonth") {
          pastDate.setMonth(now.getMonth() - 1);
        } else if (date === "ThisWeek") {
          pastDate.setDate(now.getDate() - 7);
        } else if (date === "ThisDay") {
          pastDate.setDate(now.getDate() - 1);
        }

        const { data: updates, error: updateError } = await db
          .from("update_models")
          .select("item_id, created_at")
          .gte("created_at", pastDate.toISOString());

        if (updateError) {
          return res.status(500).json(updateError);
        }

        const latestUpdates = new Map();
        updates.forEach((update) => {
          if (!latestUpdates.has(update.item_id)) {
            latestUpdates.set(update.item_id, update.created_at);
          }
        });

        itemIdsFromDateFilter = [...latestUpdates.entries()]
          .filter(([itemId, createdAt]) => new Date(createdAt) >= pastDate)
          .map(([itemId]) => itemId);

        // หากมีการกรองวันที่ แต่ไม่มีข้อมูลตรงกับช่วงเวลานั้นเลย ให้หยุดแล้วส่งอาเรย์ว่าง (เฉพาะการโหลดรอบแรก)
        if (itemIdsFromDateFilter.length === 0) {
          return res.status(200).json([]);
        }

        query = query.in("item_id", itemIdsFromDateFilter);
      }

      // ดึงข้อมูลเป็นชุดตาม offset
      const { data: dbData, error } = await query.range(currentOffset, currentOffset + fetchSize - 1);

      if (error) {
        throw error;
      }

      // ถ้าดึงข้อมูลมาแล้วได้อาเรย์ว่าง แปลว่าไม่มีข้อมูลในฐานข้อมูลให้ดึงแล้ว ให้ break ออกจากลูป
      if (!dbData || dbData.length === 0) {
        break;
      }

      // (ถ้ามีเงื่อนไขการกรองสถานะผู้ใช้ หรือเงื่อนไขอื่นๆ ที่ต้องเช็คทีหลัง สามารถเพิ่ม Filter ตรงนี้ได้เหมือน getPosts)
      // ปัจจุบันสมมติว่า dbData ที่ดึงมาผ่านเงื่อนไขหมดแล้ว
      const approvedItems = dbData;

      finalItems = [...finalItems, ...approvedItems];
      currentOffset += fetchSize;
    }

    // เอาเฉพาะตามจำนวน limit (15 รายการ) 
    const resultItems = finalItems.slice(0, limit);

    // หากไม่มีข้อมูล ให้ส่งกลับเป็น Array ว่าง
    if (resultItems.length === 0) {
      return res.status(200).json([]);
    }

    // ✅ นับจำนวนการสั่งซื้อของแต่ละ item จาก order ที่ complete
    const finalItemIds = resultItems.map((item) => item.item_id);
    let orderCountMap = {};

    if (finalItemIds.length > 0) {
      const { data: completedOrders, error: orderError } = await db
        .from("order_items")
        .select(`
          item_id,
          orders!inner(
            status
          )
        `)
        .in("item_id", finalItemIds)
        .eq("orders.status", "completed");

      if (orderError) {
        throw orderError;
      }

      if (completedOrders) {
        completedOrders.forEach((orderItem) => {
          const itemId = orderItem.item_id;
          orderCountMap[itemId] = (orderCountMap[itemId] || 0) + 1;
        });
      }
    }

    // เพิ่ม order_count เข้าไปในแต่ละ item
    const formattedResult = resultItems.map((item) => ({
      ...item,
      order_count: orderCountMap[item.item_id] || 0,
    }));

    return res.status(200).json(formattedResult);

  } catch (err) {
    console.error("Error in getItems:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getItemsById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(
      `
      *,
      update_models (
        model,
        obj,
        blend,
        fbx,
        usdz,
        gltf,
        polygon_count,
        has_textures,
        is_rigged,
        is_uv_mapped,
        version,
        created_at,
        update_summary
      ),
      users (
        username,
        name,
        profilePic
      )
    `,
    )
    .eq("item_id", id)
    .single();

  if (error) return res.status(404).json({ error: "Item not found" });

  const latestUpdate = data.update_models?.sort(
    (update1, update2) => new Date(update2.created_at) - new Date(update1.created_at),
  )[0]; // เอาตัวแรกที่มีวันที่ใหม่ที่สุด

  const formatted = {
    ...data,
    username: data.users?.username || null,
    name: data.users?.name || null,
    profilePic: data.users?.profilePic || null,
    model: latestUpdate?.model || null,
    obj: latestUpdate?.obj || null,
    blend: latestUpdate?.blend || null,
    fbx: latestUpdate?.fbx || null,
    usdz: latestUpdate?.usdz || null,
    gltf: latestUpdate?.gltf || null,
    polygon_count: latestUpdate?.polygon_count || null,
    has_textures: latestUpdate?.has_textures || false,
    is_rigged: latestUpdate?.is_rigged || false,
    is_uv_mapped: latestUpdate?.is_uv_mapped || false,
    version: latestUpdate?.version || null,
    update_summary: latestUpdate?.update_summary || null,
    created_at: latestUpdate?.created_at || null,
  };

  return res.json(formatted);
};

exports.getItemsByProjectId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(
      `
      *,
      update_models(
        model,
        created_at
      ),
      users (
        username,
        profilePic
      )
    `,
    )
    .eq("project_id", id)

  if (error) return res.status(500).json(error);

  const formatted = data.map((item) => {
    const latestUpdate = [...(item.update_models || [])].sort( // .sort() ข้างใน latestUpdate หา update ล่าสุดของ แต่ละ Item
      (update1, update2) =>
        new Date(update2.created_at) - new Date(update1.created_at)
    )[0];

    return {
      ...item,
      model: latestUpdate?.model || null,
      created_at: latestUpdate?.created_at || null,
      username: item.users?.username || null,
      profilePic: item.users?.profilePic || null,
    };
  });

  formatted.sort( // .sort() ที่ formatted เรียง Item ทั้งหมด ตาม update ล่าสุด
    (item1, item2) =>
      new Date(item2.created_at) - new Date(item1.created_at)
  );

  return res.json(formatted);
};

exports.getItemsByUserIdAvailable = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(`*, 
      update_models(created_at) 
      `)
    .eq("user_id", id)
    .is("project_id", null);

  if (error) return res.status(500).json(error);

  const formatted = data.map((item) => {
    const latestUpdate = [...(item.update_models || [])].sort( // .sort() ข้างใน latestUpdate หา update ล่าสุดของ แต่ละ Item
      (update1, update2) =>
        new Date(update2.created_at) - new Date(update1.created_at)
    )[0];

    return {
      ...item,
      created_at: latestUpdate?.created_at || null,
    };
  });

  formatted.sort( // .sort() ที่ formatted เรียง Item ทั้งหมด ตาม update ล่าสุด
    (item1, item2) =>
      new Date(item2.created_at) - new Date(item1.created_at)
  );

  return res.json(formatted);
};

exports.getItemsByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. รับค่า page และเตรียมตัวแปรสำหรับการตัด 15 ชิ้น
    const page = parseInt(req.query.page) || 0;
    const limit = 15;
    const offset = page * limit;

    // 2. ดึงสินค้าทั้งหมดของผู้ใช้
    const { data, error } = await db
      .from("items")
      .select(`
        *,
        update_models (
          created_at
        )
      `)
      .eq("user_id", id);

    if (error) return res.status(500).json(error);

    // 3. หาวันที่อัปเดตล่าสุด
    const formatted = data.map((item) => {
      const latestUpdate = [...(item.update_models || [])].sort( 
        (update1, update2) =>
          new Date(update2.created_at) - new Date(update1.created_at)
      )[0];

      return {
        ...item,
        created_at: latestUpdate?.created_at || item.created_at || null, // กันพลาดใส่ item.created_at สำรองไว้
      };
    });

    // 4. เรียง Item ทั้งหมด ตามเวลา update ล่าสุด
    formatted.sort((item1, item2) => 
      new Date(item2.created_at || 0) - new Date(item1.created_at || 0)
    );

    // 5. ✅ ตัดแบ่งข้อมูลให้เหลือแค่ 15 ชิ้น ตรงนี้เลย! 
    const paginatedItems = formatted.slice(offset, offset + limit);

    // ถ้าตัดมาแล้วไม่มีข้อมูล (ผู้ใช้เลื่อนลงไปลึกจนสุดแล้ว) ก็ส่งอาเรย์ว่างกลับได้เลย ไม่ต้องไปดึง Order ให้เหนื่อย
    if (paginatedItems.length === 0) {
      return res.status(200).json([]);
    }

    // 6. ดึงข้อมูลยอดสั่งซื้อเฉพาะ "15 ชิ้น" ที่ผ่านการตัดมาแล้ว
    const itemIds = paginatedItems.map((item) => item.item_id);
    let orderItems = []; 

    if (itemIds.length > 0) {
      const { data: completedOrders, error: orderError } = await db
        .from("order_items")
        .select(`
          item_id,
          orders!inner(
            status
          )
        `)
        .in("item_id", itemIds)
        .eq("orders.status", "completed");

      if (orderError) {
        return res.status(500).json(orderError);
      }

      orderItems = completedOrders || [];
    }

    // นับจำนวน order
    const orderCountMap = {};
    orderItems.forEach((orderItem) => { 
      const itemId = orderItem.item_id; 
      orderCountMap[itemId] = (orderCountMap[itemId] || 0) + 1;
    });

    // 7. นำ order_count ยัดกลับเข้าไปในของ 15 ชิ้นนั้น
    const result = paginatedItems.map((item) => ({
      ...item,
      order_count: orderCountMap[item.item_id] || 0,
    }));

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getItemsByUserId:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  const {
    modelName, description, price, isFree, img, model, obj, blend, fbx, usdz, gltf, category_id,
    imgPublicId, modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId,
    polygon_count, has_textures, is_rigged, is_uv_mapped
  } = req.body;

  if (!modelName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  if (!isFree && price < 10) {
    return res.status(400).json({ error: "Price must be at least 10" });
  }

  try {
    // 1. Insert ข้อมูลลงตาราง "item" ก่อน
    const { data: itemData, error: itemError } = await db
      .from("items")
      .insert([{
        modelName,
        description: description || null,
        price: Number(price),
        img: img || null,
        img_public_id: imgPublicId || null,
        category_id: category_id || null,
        user_id: req.user.user_id,
      }])
      .select()
      .single();

    // ถ้าตารางแรกพัง ให้ return error ออกไปเลย
    if (itemError) return res.status(500).json({ error: itemError.message });

    // 2. Insert ข้อมูลลงตาราง "update_models" โดยใช้ item_id จากตารางแรก
    const { data: updateModelData, error: updateModelError } = await db
      .from("update_models")
      .insert([{
        model: model || null,
        obj: obj || null,
        blend: blend || null,
        fbx: fbx || null,
        usdz: usdz || null,
        gltf: gltf || null,
        model_public_id: modelPublicId || null,
        obj_public_id: objPublicId || null,
        blend_public_id: blendPublicId || null,
        fbx_public_id: fbxPublicId || null,
        usdz_public_id: usdzPublicId || null,
        gltf_public_id: gltfPublicId || null,
        polygon_count: polygon_count ? parseInt(polygon_count) : 0,
        has_textures: has_textures || false,
        is_rigged: is_rigged || false,
        is_uv_mapped: is_uv_mapped || false,
        version: "1.0",
        update_summary: description || null,
        item_id: itemData.item_id // เชื่อมโยงกับ item_id ของไอเทมที่เพิ่งสร้างจาก itemData
      }])
      .select()
      .single();

    // ถ้าตารางสองพัง (คุณอาจจะพิจารณาลบข้อมูลตารางแรกทิ้งด้วยเพื่อไม่ให้ข้อมูลขยะค้าง หรือปล่อยผ่านแล้ว return error)
    if (updateModelError) {
      // Optional: db.from('item').delete().eq('item_id', itemData.item_id);
      return res.status(500).json({ error: updateModelError.message });
    }

    const { data: category } = await db
      .from("categories")
      .select("type")
      .eq("category_id", itemData.category_id)
      .single();

    // 3. ส่งข้อมูลเข้า Algolia
    try {
      await algoliaClient.saveObject({
        indexName: 'WebCommunity_Search',
        body: {
          objectID: `item_${itemData.item_id}`,
          title: itemData.modelName,
          description: itemData.description,
          img: itemData.img,
          type: 'item',
          category: category?.type,
          targetId: itemData.item_id
        }
      });
    } catch (algoliaErr) {
      console.error("Algolia Insert Item Warning:", algoliaErr);
    }

    // Return ข้อมูลทั้งหมดเมื่อสำเร็จ
    return res.status(201).json({ item: itemData, models: updateModelData });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.editItem = async (req, res) => {
  const {
    itemId, modelName, description, price, img, category_id, imgPublicId // เพิ่ม imgPublicId ตรงนี้
  } = req.body;

  try {
    // 1. ดึงข้อมูลไอเทมเดิมมาก่อน เพื่อเอาไปใช้กับ Algolia และเช็คลบรูปภาพเก่า
    const { data: items, error: fetchError } = await db
      .from("items")
      .select("*")
      .eq("item_id", itemId)
      .single();

    if (fetchError || !items) {
      return res.status(404).json({ error: "Item not found" });
    }

    // 2. สร้าง Object สำหรับ Update
    const updateData = {};

    if (modelName && modelName.trim() !== "") updateData.modelName = modelName;
    if (description && description.trim() !== "") updateData.description = description;
    if (price && !isNaN(price)) updateData.price = parseFloat(price);
    if (category_id) updateData.category_id = category_id;
    if (img) updateData.img = img;
    // หากมีการอัปเดต imgPublicId ก็บันทึกลง DB ด้วย (ถ้ามีคอลัมน์นี้)
    if (imgPublicId) updateData.img_public_id = imgPublicId;

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: "Nothing to update" });
    }

    // 3. Update ลง DB
    const { error: updateError } = await db
      .from("items")
      .update(updateData)
      .eq("item_id", itemId);

    if (updateError) return res.status(500).json({ error: updateError.message });

    const finalCategoryId = category_id || items.category_id;

    const { data: category } = await db
      .from("categories")
      .select("type")
      .eq("category_id", finalCategoryId)
      .single();

    // 4. อัปเดตข้อมูลบน Algolia v5
    try {
      await algoliaClient.saveObject({
        indexName: "WebCommunity_Search",
        body: {
          objectID: `item_${itemId}`,
          title: updateData.modelName || items.modelName,
          description: updateData.description !== undefined ? updateData.description : items.description,
          img: updateData.img || items.img,
          type: "item",
          category: category?.type,
          targetId: itemId,
        },
      });
    } catch (algoliaErr) {
      console.error("Algolia Update Item Warning:", algoliaErr);
    }

    // 5. จัดการลบรูปภาพเก่า
    const oldImgId = items.img_public_id; // ตอนนี้เรียก items ได้แล้ว

    // ถ้ามีการส่งรูปใหม่มา และของเก่ามี public_id และไอดีไม่ตรงกัน
    if (imgPublicId && oldImgId && oldImgId !== imgPublicId) {
      await cloudinary.uploader.destroy(oldImgId);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    // แปลง error เป็น string ข้อความให้ฝั่งหน้าบ้านจับได้
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

exports.updateVersion = async (req, res) => {
  const {
    itemId, updateModelsId, version, summary, model, obj, blend, fbx, usdz, gltf,
    modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId,
    polygon_count, has_textures, is_rigged, is_uv_mapped,
    isNewVersion, img1, img2, // รับค่า Checkbox มาจาก Frontend
  } = req.body;

  try {
    let targetItem; // ตัวแปรสำหรับเก็บข้อมูลเวอร์ชันที่เราจะเอามาเทียบ

    // 1. ตรวจสอบและดึงข้อมูลเป้าหมาย
    if (isNewVersion) {
      // กรณีสร้างใหม่ ดึงเวอร์ชันล่าสุดมาเป็น Base สำหรับ fallback ข้อมูล (ตามลอจิกเดิม)
      const { data, error } = await db
        .from("update_models")
        .select("*, imgs(*)")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: "Item not found" });
      targetItem = data;

    } else {
      // กรณีบันทึกทับ ต้องดึงข้อมูลของเวอร์ชันนั้นๆ มาเทียบโดยตรง
      if (!updateModelsId) return res.status(400).json({ error: "Missing version ID" });

      const { data, error } = await db
        .from("update_models")
        .select("*, imgs(*)")
        .eq("update_models_id", updateModelsId)
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      if (!data) return res.status(404).json({ error: "Target version not found" });
      targetItem = data;
    }

    // 2. ฟังก์ชันตรวจสอบการเปลี่ยนแปลง (เปลี่ยนจาก latestItem เป็น targetItem)
    const checkIsChanged = () => {
      if (version && version.trim() !== targetItem.version) return true;
      if (summary && summary.trim() !== targetItem.update_summary) return true;
      if (polygon_count !== undefined && parseInt(polygon_count) !== targetItem.polygon_count) return true;
      if (has_textures !== undefined && has_textures !== targetItem.has_textures) return true;
      if (is_rigged !== undefined && is_rigged !== targetItem.is_rigged) return true;
      if (is_uv_mapped !== undefined && is_uv_mapped !== targetItem.is_uv_mapped) return true;

      if (modelPublicId !== undefined && modelPublicId !== targetItem.model_public_id) return true;
      if (objPublicId !== undefined && objPublicId !== targetItem.obj_public_id) return true;
      if (blendPublicId !== undefined && blendPublicId !== targetItem.blend_public_id) return true;
      if (fbxPublicId !== undefined && fbxPublicId !== targetItem.fbx_public_id) return true;
      if (usdzPublicId !== undefined && usdzPublicId !== targetItem.usdz_public_id) return true;
      if (gltfPublicId !== undefined && gltfPublicId !== targetItem.gltf_public_id) return true;

      const oldImg1 = targetItem.imgs && targetItem.imgs[0] ? targetItem.imgs[0].img : null;
      const oldImg2 = targetItem.imgs && targetItem.imgs[1] ? targetItem.imgs[1].img : null;
      if (img1 !== undefined && img1 !== oldImg1) return true;
      if (img2 !== undefined && img2 !== oldImg2) return true;

      return false;
    };

    if (!isNewVersion && !checkIsChanged()) {
      return res.status(400).json({ error: "No changes detected. Please modify the data before saving." });
    }

    // =========================================================
    // กรณีที่ 1: ติ๊กบันทึกเป็นเวอร์ชันใหม่ (INSERT)
    // =========================================================
    if (isNewVersion) {
      const newVersionData = {
        item_id: itemId,
        version: version ? version.trim() : targetItem.version,
        update_summary: summary ? summary.trim() : targetItem.update_summary,
        polygon_count: polygon_count !== undefined ? parseInt(polygon_count) : targetItem.polygon_count,
        has_textures: has_textures !== undefined ? has_textures : targetItem.has_textures,
        is_rigged: is_rigged !== undefined ? is_rigged : targetItem.is_rigged,
        is_uv_mapped: is_uv_mapped !== undefined ? is_uv_mapped : targetItem.is_uv_mapped,

        // การใส่ไฟล์: ถ้าส่ง undefined มา ให้ดึงของเก่ามาใช้ / ถ้าส่ง null มา ก็บันทึกเป็น null (แปลว่าเอาออกในเวอร์ชันใหม่)
        model: modelPublicId !== undefined ? model : targetItem.model,
        model_public_id: modelPublicId !== undefined ? modelPublicId : targetItem.model_public_id,
        obj: objPublicId !== undefined ? obj : targetItem.obj,
        obj_public_id: objPublicId !== undefined ? objPublicId : targetItem.obj_public_id,
        blend: blendPublicId !== undefined ? blend : targetItem.blend,
        blend_public_id: blendPublicId !== undefined ? blendPublicId : targetItem.blend_public_id,
        fbx: fbxPublicId !== undefined ? fbx : targetItem.fbx,
        fbx_public_id: fbxPublicId !== undefined ? fbxPublicId : targetItem.fbx_public_id,
        usdz: usdzPublicId !== undefined ? usdz : targetItem.usdz,
        usdz_public_id: usdzPublicId !== undefined ? usdzPublicId : targetItem.usdz_public_id,
        gltf: gltfPublicId !== undefined ? gltf : targetItem.gltf,
        gltf_public_id: gltfPublicId !== undefined ? gltfPublicId : targetItem.gltf_public_id,
      };

      // 🌟 2. เพิ่ม .select().single() เพื่อเอา ID ที่เพิ่งสร้างใหม่มาใช้
      const { data: newModel, error: insertError } = await db
        .from("update_models")
        .insert(newVersionData)
        .select()
        .single();

      if (insertError) return res.status(500).json({ error: insertError.message });

      // 🌟 3. บันทึกรูปลงตาราง imgs โดยผูกกับ update_models_id ใหม่
      const newImgs = [];
      if (img1) newImgs.push({ update_models_id: newModel.update_models_id, img: img1 });
      if (img2) newImgs.push({ update_models_id: newModel.update_models_id, img: img2 });
      if (newImgs.length > 0) {
        await db.from("imgs").insert(newImgs);
      }

      return res.status(201).json({ success: true, message: "Published as new version successfully!" });
    }

    // =========================================================
    // กรณีที่ 2: อัปเดตทับ Row เดิม (UPDATE) + สั่งลบไฟล์เก่าจาก Cloudinary
    // =========================================================
    else {
      const updateData = {};
      const filesToDelete = [];

      if (version && version.trim() !== targetItem.version) updateData.version = version.trim();
      if (summary && summary.trim() !== targetItem.update_summary) updateData.update_summary = summary.trim();
      if (polygon_count !== undefined && parseInt(polygon_count) !== targetItem.polygon_count) updateData.polygon_count = parseInt(polygon_count);
      if (has_textures !== undefined && has_textures !== targetItem.has_textures) updateData.has_textures = has_textures;
      if (is_rigged !== undefined && is_rigged !== targetItem.is_rigged) updateData.is_rigged = is_rigged;
      if (is_uv_mapped !== undefined && is_uv_mapped !== targetItem.is_uv_mapped) updateData.is_uv_mapped = is_uv_mapped;

      // Helper function: เช็คเฉพาะช่องที่ส่งมาไม่เท่ากับ undefined เท่านั้น
      const handleFileUpdate = (field, pubField, reqUrl, reqPubId, dbPubId, isRawType) => {
        if (reqPubId !== undefined && reqPubId !== dbPubId) {
          updateData[field] = reqUrl;
          updateData[pubField] = reqPubId;
          // ถ้ามีรหัสเดิมอยู่ใน DB เอาใส่คิวรอเผาทิ้ง
          if (dbPubId) {
            filesToDelete.push({ id: dbPubId, isRaw: isRawType });
          }
        }
      };

      handleFileUpdate("model", "model_public_id", model, modelPublicId, targetItem.model_public_id, false);
      handleFileUpdate("obj", "obj_public_id", obj, objPublicId, targetItem.obj_public_id, true);
      handleFileUpdate("blend", "blend_public_id", blend, blendPublicId, targetItem.blend_public_id, true);
      handleFileUpdate("fbx", "fbx_public_id", fbx, fbxPublicId, targetItem.fbx_public_id, true);
      handleFileUpdate("usdz", "usdz_public_id", usdz, usdzPublicId, targetItem.usdz_public_id, true);
      handleFileUpdate("gltf", "gltf_public_id", gltf, gltfPublicId, targetItem.gltf_public_id, true);

      // อัปเดตตาราง
      const { error: updateError } = await db
        .from("update_models")
        .update(updateData)
        .eq("update_models_id", targetItem.update_models_id);

      if (updateError) return res.status(500).json({ error: updateError.message });

      await db.from("imgs").delete().eq("update_models_id", targetItem.update_models_id);

      const updatedImgs = [];
      if (img1) updatedImgs.push({ update_models_id: targetItem.update_models_id, img: img1 });
      if (img2) updatedImgs.push({ update_models_id: targetItem.update_models_id, img: img2 });
      if (updatedImgs.length > 0) {
        await db.from("imgs").insert(updatedImgs);
      }

      // เกราะป้องกันชั้นสุดท้าย: ดูว่าไฟล์ที่อยู่ในคิวจะลบ มีใครยังใช้อยู่ในช่องอื่นไหม
      const activeIds = [
        updateData.model_public_id !== undefined ? updateData.model_public_id : targetItem.model_public_id,
        updateData.obj_public_id !== undefined ? updateData.obj_public_id : targetItem.obj_public_id,
        updateData.blend_public_id !== undefined ? updateData.blend_public_id : targetItem.blend_public_id,
        updateData.fbx_public_id !== undefined ? updateData.fbx_public_id : targetItem.fbx_public_id,
        updateData.usdz_public_id !== undefined ? updateData.usdz_public_id : targetItem.usdz_public_id,
        updateData.gltf_public_id !== undefined ? updateData.gltf_public_id : targetItem.gltf_public_id,
      ].filter(Boolean); // ล้างค่าว่างทิ้ง

      // คัดกรองเหลือเฉพาะไฟล์ที่ปลอดภัยต่อการลบจริงๆ
      const safeFilesToDelete = filesToDelete.filter(file => !activeIds.includes(file.id));

      if (safeFilesToDelete.length > 0) {
        for (const file of safeFilesToDelete) {
          try {
            if (file.isRaw) {
              await cloudinary.uploader.destroy(file.id, { resource_type: "raw" });
            } else {
              await cloudinary.uploader.destroy(file.id);
            }
          } catch (cloudError) {
            console.error("Cloudinary Delete Error:", cloudError);
          }
        }
      }

      return res.status(200).json({ success: true, message: "Model details updated successfully" });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

// itemController.js (ทำเหมือนกัน)
exports.getItemsForEditProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await db
    .from("items")
    .select("*")
    .or(
      `project_id.eq.${projectId},and(user_id.eq.${userId},project_id.is.null)`,
    );

  if (error) return res.status(500).json(error);
  return res.status(200).json(data || []);
};

exports.getLatestItems = async (req, res) => {
  try {
    const { data, error } = await db
      .from("items") // เปลี่ยนชื่อตารางตามที่คุณใช้
      .select(`*,
        update_models(created_at)
        `);

    if (error) throw error;

    const formatted = data.map((item) => {
      const latestUpdate = [...(item.update_models || [])].sort( // .sort() ข้างใน latestUpdate หา update ล่าสุดของ แต่ละ Item
        (update1, update2) =>
          new Date(update2.created_at) - new Date(update1.created_at)
      )[0];

      return {
        ...item,
        created_at: latestUpdate?.created_at || null,
      };
    });

    formatted.sort((item1, item2) => // .sort() ที่ formatted เรียง Item ทั้งหมด ตาม update ล่าสุด
      new Date(item2.created_at) - new Date(item1.created_at)
    );

    return res.status(200).json(formatted.slice(0, 2));
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getItemsByCategory = async (req, res) => {
  const { categoryId } = req.params; // รับค่า :categoryId จาก path
  const { limit } = req.query; // รับค่า ?limit=5 จาก query

  // กำหนดจำนวน limit (ถ้าไม่ส่งมาให้ค่าเริ่มต้นเป็น 10)
  const parsedLimit = parseInt(limit) || 10;

  try {
    const { data, error } = await db
      .from("items")
      .select(`item_id, modelName, description, img, price, user_id,
        update_models(created_at)
        `) // เลือกเฉพาะฟิลด์ที่ใช้แสดงใน Card
      .eq("category_id", categoryId);

    if (error) {
      return res.status(500).json(error);
    }

    const formatted = data.map((item) => {
      const latestUpdate = [...(item.update_models || [])].sort( // .sort() ข้างใน latestUpdate หา update ล่าสุดของ แต่ละ Item
        (update1, update2) =>
          new Date(update2.created_at) - new Date(update1.created_at)
      )[0];

      return {
        ...item,
        created_at: latestUpdate?.created_at || null,
      };
    });

    formatted.sort((item1, item2) => // .sort() ที่ formatted เรียง Item ทั้งหมด ตาม update ล่าสุด
      new Date(item2.created_at) - new Date(item1.created_at)
    );

    return res.status(200).json(formatted.slice(0, parsedLimit));

  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addReview = async (req, res) => {
  const userId = req.user.user_id;
  const { itemId, description, points } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await db
    .from("reviews")
    .insert([
      {
        user_id: userId,
        item_id: itemId,
        review: description,
        points: points
      }])
    .select()
    .single();

  if (error) return res.status(500).json(error);
  return res.status(201).json(data);
};

exports.getReviewsByItemId = async (req, res) => {
  const { itemId } = req.params;

  try {
    const { data, error } = await db
      .from("reviews")
      .select(
        `
        *,
        users (
          username,
          name,
          profilePic
        )
      `,
      )
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getCategories = async (req, res) => {
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("type");

  if (error) return res.status(500).json(error);

  res.status(200).json(data);
};

exports.getItemAllVersions = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("update_models")
    .select(
      `*, imgs(*)`,
    )
    .eq("item_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(404).json({ error: "Item not found" });
  return res.json(data);
};

exports.getItemTimeline = async (req, res) => {
  const { itemId } = req.params;

  try {
    const { data, error } = await db
      .from("items")
      .select(`
        item_id,
        update_models (
          update_models_id,
          version,
          update_summary,
          model,
          created_at,
          imgs(img)
        )
      `)
      .eq("item_id", itemId)
      .single();

    if (error) {
      console.error("getItemTimeline error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // เรียง Version ล่าสุดก่อน
    const updates = [...(data.update_models || [])].sort(
      (update1, update2) =>
        new Date(update2.created_at) - new Date(update1.created_at)
    );

    const formatted = {
      item_id: data.item_id,

      // Timeline
      updates: updates.map((update) => ({
        update_models_id: update.update_models_id,
        version: update.version,
        update_summary: update.update_summary,
        model: update.model,
        created_at: update.created_at,
        imgs: update.imgs || [], // ส่งรูปทั้งหมด
      })),
    };

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("getItemTimeline error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
