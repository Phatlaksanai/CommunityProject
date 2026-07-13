const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require("../config/algolia");

exports.getItems = async (req, res) => {
  const { category, date } = req.query;

  let query = db.from("items").select("*");

  // ✅ filter category
  if (category) {
    // ถ้าเลือกหลาย category → เป็น array
    const categories = Array.isArray(category) ? category : [category];
    query = query.in("category", categories);
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
  const { modelName, description, price, img, model, obj, blend, fbx, usdz, gltf, category, imgPublicId, modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId } = req.body;

  if (!modelName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  if (price < 10) {
    return res.status(400).json({ error: "Price must be at least 10" });
  }

  const { data, error } = await db
    .from("items")
    .insert([
      {
        modelName,
        description: description || null,
        price: Number(price),
        img: img || null,
        model: model || null,
        obj: obj || null,
        blend: blend || null,
        fbx: fbx || null,
        usdz: usdz || null,
        gltf: gltf || null,
        category: category || null,
        user_id: req.user.user_id,
        img_public_id: imgPublicId || null,
        model_public_id: modelPublicId || null,
        obj_public_id: objPublicId || null,
        blend_public_id: blendPublicId || null,
        fbx_public_id: fbxPublicId || null,
        usdz_public_id: usdzPublicId || null,
        gltf_public_id: gltfPublicId || null,
      }])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  // 🚀 2. [เพิ่มคำสั่ง Algolia v5] ส่งข้อมูลไอเทมใหม่เข้าสู่คลังค้นหารวม
  try {
    await algoliaClient.saveObject({
      indexName: 'WebCommunity_Search', // ใช้ชื่อคลังข้อมูลเดียวกันกับฝั่งคอมมูนิตี้
      body: {
        objectID: `item_${data.item_id}`, // ใช้ prefix ไอเดีย item_ เพื่อแยกแยะฝั่งหน้าบ้าน
        title: data.modelName,            // แมปชื่อสินค้าเข้าช่อง title ตรงกลาง
        description: data.description,    // แมปคำอธิบายสินค้าเข้าช่อง description
        img: data.img,                    // แมป URL รูปภาพเข้าช่อง img (ถ้ามี)
        type: 'item',                    // ระบุ type เป็นไอเทมเพื่อส่งหน้าบ้านไปถูกหน้ามาร์เก็ต
        targetId: data.item_id
      }
    });
  } catch (algoliaErr) {
    // ดักแยกไว้เผื่อระบบเสิร์ชชั่วคราว ข้อมูลหลักในดาต้าเบสจะได้เซฟสำเร็จปกติ
    console.error("Algolia Insert Item Warning:", algoliaErr);
  }

  return res.status(201).json(data);
};

exports.updateItem = async (req, res) => {
  const { itemId ,modelName, description, price, img, model, obj, blend, fbx, usdz, gltf, category, imgPublicId, modelPublicId, objPublicId, blendPublicId, fbxPublicId, usdzPublicId, gltfPublicId } = req.body;

  try {
    const { data: items, error } = await db
      .from("items")
      .select(`img_public_id, 
                    model_public_id, 
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
    if (modelName && modelName.trim() !== "") updateData.modelName = modelName;
    if (description && description.trim() !== "") updateData.description = description;
    if (price && !isNaN(price)) updateData.price = parseFloat(price);
    if (category && category.trim() !== "") updateData.category = category;

    // ส่วนของรูปภาพ (ใช้ logic เดิมของคุณ)
    if (img) updateData.img = img;
    if (model) updateData.model = model;
    if (obj) updateData.obj = obj;
    if (blend) updateData.blend = blend;
    if (fbx) updateData.fbx = fbx;
    if (usdz) updateData.usdz = usdz;
    if (gltf) updateData.gltf = gltf;
    if (imgPublicId) updateData.img_public_id = imgPublicId;
    if (modelPublicId) updateData.model_public_id = modelPublicId;
    if (objPublicId) updateData.obj_public_id = objPublicId;
    if (blendPublicId) updateData.blend_public_id = blendPublicId;
    if (fbxPublicId) updateData.fbx_public_id = fbxPublicId;
    if (usdzPublicId) updateData.usdz_public_id = usdzPublicId;
    if (gltfPublicId) updateData.gltf_public_id = gltfPublicId;

    // ตรวจสอบว่ามีข้อมูลที่จะ update ไหม (ป้องกันการยิง update เปล่าๆ)
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: "Nothing to update" });
    }

    // 3. Update ลง DB
    const { error: updateError } = await db
      .from("items")
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
    const oldModelId = items?.model_public_id;
    const oldObjId = items?.obj_public_id;
    const oldBlendId = items?.blend_public_id;
    const oldFbxId = items?.fbx_public_id;
    const oldUsdzId = items?.usdz_public_id;
    const oldGltfId = items?.gltf_public_id;

    // แล้วค่อยลบ
    if (imgPublicId && oldImgId && oldImgId !== imgPublicId) {
      await cloudinary.uploader.destroy(oldImgId);
    }

    if (modelPublicId && oldModelId && oldModelId !== modelPublicId) {
      await cloudinary.uploader.destroy(oldModelId);
    }

    if (objPublicId && oldObjId && oldObjId !== objPublicId) {
      await cloudinary.uploader.destroy(oldObjId);
    }

    if (blendPublicId && oldBlendId && oldBlendId !== blendPublicId) {
      await cloudinary.uploader.destroy(oldBlendId);
    }

    if (fbxPublicId && oldFbxId && oldFbxId !== fbxPublicId) {
      await cloudinary.uploader.destroy(oldFbxId);
    }

    if (usdzPublicId && oldUsdzId && oldUsdzId !== usdzPublicId) {
      await cloudinary.uploader.destroy(oldUsdzId);
    }

    if (gltfPublicId && oldGltfId && oldGltfId !== gltfPublicId) {
      await cloudinary.uploader.destroy(oldGltfId);
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