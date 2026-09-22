const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require("../config/algolia");

exports.getItems = async (req, res) => {
  const { category_id, date } = req.query;

  let query = db.from("items")
    .select(`*,
      categories(
        category_id,
        type
      )`
    );

  // ✅ filter category
  if (category_id) {
    // ถ้าเลือกหลาย category → เป็น array
    const categoryIds = Array.isArray(category_id) ? category_id : [category_id];
    query = query.in("category_id", categoryIds);
  }

  // ✅ filter date
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

    query = query.gte("created_at", pastDate.toISOString());
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.status(200).json(data || []);
};

exports.getItemsById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(`
      *,
      users (
        username,
        name,
        profilePic
      )
    `)
    .eq("item_id", id)
    .single();

  if (error) return res.status(404).json({ error: "Item not found" });

  const formatted = {
    ...data,
    username: data.users?.username || null,
    name: data.users?.name || null,
    profilePic: data.users?.profilePic || null,
  };

  return res.json(formatted);
};

exports.getItemsByProjectId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(`
      *,
      users (
        username,
        profilePic
      )
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.json(data || []);
};

exports.getItemsByUserIdAvailable = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("user_id", id)
    .is("project_id", null)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.json(data || []);
};

exports.getItemsByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.json(data || []);
};

exports.addItem = async (req, res) => {
  const {
    modelName, description, price, img, model, obj, blend, fbx, usdz, gltf, category_id,
    imgPublicId, modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId,
    polygon_count, has_textures, is_rigged, is_uv_mapped
  } = req.body;

  if (!modelName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  if (price < 10) {
    return res.status(400).json({ error: "Price must be at least 10" });
  }

  try {
    // 1. Insert ข้อมูลลงตาราง "item" ก่อน
    const { data: itemData, error: itemError } = await db
      .from("item")
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
        version: "1.0.0",
        item_id: itemData.item_id // เชื่อมโยงกับ item_id ของไอเทมที่เพิ่งสร้างจาก itemData
      }])
      .select()
      .single();

    // ถ้าตารางสองพัง (คุณอาจจะพิจารณาลบข้อมูลตารางแรกทิ้งด้วยเพื่อไม่ให้ข้อมูลขยะค้าง หรือปล่อยผ่านแล้ว return error)
    if (updateModelError) {
      // Optional: db.from('item').delete().eq('item_id', itemData.item_id);
      return res.status(500).json({ error: updateModelError.message });
    }

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
    itemId, modelName, description, price, img, category_id,
  } = req.body;

  try {
    // 2. สร้าง Object สำหรับ Update (เช็คเฉพาะที่มีค่าจริงๆ)
    const updateData = {};

    // ใช้ .trim() เพื่อเช็คว่าไม่ใช่การเคาะ Space bar ว่างๆ
    if (modelName && modelName.trim() !== "") updateData.modelName = modelName;
    if (description && description.trim() !== "") updateData.description = description;
    if (price && !isNaN(price)) updateData.price = parseFloat(price);
    if (category_id) updateData.category_id = category_id;
    // ส่วนของรูปภาพ (ใช้ logic เดิมของคุณ)
    if (img) updateData.img = img;

    // ตรวจสอบว่ามีข้อมูลที่จะ update ไหม (ป้องกันการยิง update เปล่าๆ)
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: "Nothing to update" });
    }

    // 3. Update ลง DB
    const { error: updateError } = await db
      .from("item")
      .update(updateData) // ส่งเฉพาะ field ที่มีค่าไป
      .eq("item_id", itemId);

    if (updateError) return res.status(500).json(updateError);

    // 🚀 [เพิ่มคำสั่ง Algolia v5] สั่งบันทึกทับข้อมูลสินค้าบนคลังเสิร์ชด้วย objectID เดิม
    try {
      await algoliaClient.saveObject({
        indexName: 'WebCommunity_Search', // ชื่อคลังกลางที่ใช้ร่วมกัน
        body: {
          objectID: `item_${itemId}`, // ต้องใช้รูปแบบไอดีเดียวกับตอนสร้าง (addItem) เพื่อให้มันบันทึกทับตัวเดิม
          title: updateData.modelName || items.modelName, // ใช้ค่าใหม่ ถ้าไม่มีให้ใช้ค่าเดิมใน DB
          description: updateData.description !== undefined ? updateData.description : items.description,
          img: updateData.img || items.img, // ใช้ค่าใหม่ ถ้าไม่มีให้ใช้ค่าเดิมใน DB
          type: 'item',
          targetId: itemId
        }
      });
    } catch (algoliaErr) {
      console.error("Algolia Update Item Warning:", algoliaErr);
    }

    // เก็บ id เก่าไว้ก่อน
    const oldImgId = items?.img_public_id;

    // แล้วค่อยลบ
    if (imgPublicId && oldImgId && oldImgId !== imgPublicId) {
      await cloudinary.uploader.destroy(oldImgId);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateVersion = async (req, res) => {
  const {
    itemId, version, summary, model, obj, blend, fbx, usdz, gltf,
    modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId,
    polygon_count, has_textures, is_rigged, is_uv_mapped // เพิ่มฟิลด์ใหม่
  } = req.body;

  try {
    const { data: items, error } = await db
      .from("update_models")
      .select(`model_public_id, 
                    obj_public_id, 
                    blend_public_id, 
                    fbx_public_id, 
                    usdz_public_id, 
                    gltf_public_id`)
      .eq("item_id", itemId)
      .maybeSingle();
    if (error) {
      return res.status(500).json(error);
    }

    // 2. สร้าง Object สำหรับ Update (เช็คเฉพาะที่มีค่าจริงๆ)
    const updateData = {};

    // ใช้ .trim() เพื่อเช็คว่าไม่ใช่การเคาะ Space bar ว่างๆ
    if (version) updateData.version = version.trim();
    if (summary) updateData.summary = summary.trim();
    if (model) updateData.model = model;
    if (obj) updateData.obj = obj;
    if (blend) updateData.blend = blend;
    if (fbx) updateData.fbx = fbx;
    if (usdz) updateData.usdz = usdz;
    if (gltf) updateData.gltf = gltf;
    if (modelPublicId) updateData.model_public_id = modelPublicId;
    if (objPublicId) updateData.obj_public_id = objPublicId;
    if (blendPublicId) updateData.blend_public_id = blendPublicId;
    if (fbxPublicId) updateData.fbx_public_id = fbxPublicId;
    if (usdzPublicId) updateData.usdz_public_id = usdzPublicId;
    if (gltfPublicId) updateData.gltf_public_id = gltfPublicId;

    if (polygon_count !== undefined) updateData.polygon_count = parseInt(polygon_count) || 0;
    if (has_textures !== undefined) updateData.has_textures = has_textures;
    if (is_rigged !== undefined) updateData.is_rigged = is_rigged;
    if (is_uv_mapped !== undefined) updateData.is_uv_mapped = is_uv_mapped;

    // ตรวจสอบว่ามีข้อมูลที่จะ update ไหม (ป้องกันการยิง update เปล่าๆ)
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: "Nothing to update" });
    }

    // 3. Update ลง DB
    const { error: updateError } = await db
      .from("update_models")
      .update(updateData) // ส่งเฉพาะ field ที่มีค่าไป
      .eq("item_id", itemId);

    if (updateError) return res.status(500).json(updateError);

    // เก็บ id เก่าไว้ก่อน
    const oldModelId = items?.model_public_id;
    const oldObjId = items?.obj_public_id;
    const oldBlendId = items?.blend_public_id;
    const oldFbxId = items?.fbx_public_id;
    const oldUsdzId = items?.usdz_public_id;
    const oldGltfId = items?.gltf_public_id;

    if (modelPublicId && oldModelId && oldModelId !== modelPublicId) {
      await cloudinary.uploader.destroy(oldModelId);
    }

    if (objPublicId && oldObjId && oldObjId !== objPublicId) {
      await cloudinary.uploader.destroy(oldObjId, { resource_type: "raw" });
    }

    if (blendPublicId && oldBlendId && oldBlendId !== blendPublicId) {
      await cloudinary.uploader.destroy(oldBlendId, { resource_type: "raw" });
    }

    if (fbxPublicId && oldFbxId && oldFbxId !== fbxPublicId) {
      await cloudinary.uploader.destroy(oldFbxId, { resource_type: "raw" });
    }

    if (usdzPublicId && oldUsdzId && oldUsdzId !== usdzPublicId) {
      await cloudinary.uploader.destroy(oldUsdzId, { resource_type: "raw" });
    }

    if (gltfPublicId && oldGltfId && oldGltfId !== gltfPublicId) {
      await cloudinary.uploader.destroy(oldGltfId, { resource_type: "raw" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// itemController.js (ทำเหมือนกัน)
exports.getItemsForEditProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await db
    .from("items")
    .select("*")
    .or(`project_id.eq.${projectId},and(user_id.eq.${userId},project_id.is.null)`);

  if (error) return res.status(500).json(error);
  return res.status(200).json(data || []);
};

exports.getLatestItems = async (req, res) => {
  try {
    const { data, error } = await db
      .from("items") // เปลี่ยนชื่อตารางตามที่คุณใช้
      .select("*")
      .order("created_at", { ascending: false }) // เรียงจากใหม่ไปเก่า
      .range(0, 1); // ดึงลำดับที่ 0 และ 1 (รวมเป็น 2 อัน)

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getItemsByCategory = async (req, res) => {
  const { categoryId } = req.params; // รับค่า :categoryId จาก path
  const { limit } = req.query;       // รับค่า ?limit=5 จาก query

  // กำหนดจำนวน limit (ถ้าไม่ส่งมาให้ค่าเริ่มต้นเป็น 10)
  const parsedLimit = parseInt(limit) || 10;

  try {
    const { data, error } = await db
      .from("items")
      .select("item_id, modelName, description, img, price, user_id") // เลือกเฉพาะฟิลด์ที่ใช้แสดงใน Card
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false }) // เรียงตามเวลาสร้าง ล่าสุดขึ้นก่อน
      .limit(parsedLimit);

    if (error) {
      return res.status(500).json(error);
    }

    return res.status(200).json(data);
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
      .select(`
        *,
        users (
          username,
          name,
          profilePic
        )
      `)
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

  if (error)
    return res.status(500).json(error);

  res.status(200).json(data);
};