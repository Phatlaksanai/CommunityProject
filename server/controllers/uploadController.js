const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// 3. ตั้งค่าให้ Multer เก็บไฟล์ที่อัปโหลดไว้ใน RAM (Memory) ในรูปแบบ Buffer
// ไม่ต้องสร้างไฟล์ชั่วคราวบนเครื่อง Server ให้เปลืองพื้นที่ และรวดเร็วกว่า
const storage = multer.memoryStorage(); // 3
// 2. สร้าง Middleware ของ Multer สำหรับรับไฟล์
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // จำกัดขนาด 10MB
}).single("file");// หวังว่า Client จะส่งไฟล์มาในฟิลด์ที่ชื่อว่า "file" (รับแค่ 1 ไฟล์)

// 1 ตัวอัปโหลดหลัก
// รับค่า ชื่อโฟลเดอร์หลัก และ allowModel (อนุญาตให้อัปไฟล์โมเดลค่าเริ่มต้นคือ true)
const uploadHandler = (baseFolder, allowModel = true) => [
  upload, // 1: ให้ Multer รับไฟล์มาเก็บใน RAM ก่อน
  async (req, res) => { // 2: ฟังก์ชันจัดการอัปโหลดขึ้น Cloudinary
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // เช็คว่าไฟล์นี้เป็นไฟล์โมเดล 3 มิติหรือไม่ 
      // (ต้องมีการอนุญาต allowModel = true และ นามสกุลไฟล์ตรงตามเงื่อนไข)
      const isModel = allowModel && isModelFile(req.file.originalname);

      // ส่ง Buffer (ข้อมูลไฟล์จาก RAM) ไปอัปโหลดขึ้น Cloudinary ผ่านฟังก์ชัน streamUpload
      const result = await streamUpload(
        req.file.buffer,// ข้อมูลไฟล์ดิบ
        baseFolder,// ชื่อโฟลเดอร์หลัก
        isModel,// เป็นโมเดลหรือไม่ (true/false)
        req.file.originalname// ชื่อไฟล์ต้นฉบับ
      );

      // เมื่ออัปโหลดเสร็จ คืนค่า URL และ ID ของไฟล์กลับไปให้ Client
      res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
];

// 4. เช็คว่าเป็นโมเดลไหม
const isModelFile = (filename) => {
  const lower = filename.toLowerCase();
  return lower.endsWith(".glb") || lower.endsWith(".zip"); // คืนค่า true ถ้าไฟล์ลงท้ายด้วย .glb หรือ .zip
};

// 5. อัปโหลดไฟล์จาก RAM ขึ้น Cloudinary แบบ Stream (ส่งข้อมูลต่อเนื่อง)
const streamUpload = (fileBuffer, folder, isModel, originalName) => {
  return new Promise((resolve, reject) => { // ใช้ Promise เพื่อให้ใช้ async/await ได้ในข้อ 1
    const uploadOptions = {
      folder: isModel ? `${folder}/models` : `${folder}/Pictures`,
      resource_type: isModel ? "raw" : "image",
      public_id: `${Date.now()}-${originalName.split('.')[0]}`,
      format: isModel ? originalName.split('.').pop() : undefined
    };

    // สร้างท่อส่งข้อมูล (Stream) ไปยัง Cloudinary
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (result) resolve(result);// ถ้าสำเร็จ ให้ส่งผลลัพธ์ออกไป
      else reject(error);// ถ้าพัง ให้แจ้ง error
    });

    stream.end(fileBuffer);// เริ่มปล่อยข้อมูลไฟล์ (Buffer) ไหลเข้าไปในท่อ (Stream) จนจบ
  });
};


// หมวดหมู่ไหนที่ไม่ต้องการให้คนอัปโหลดโมเดล 3 มิติ จะตั้งค่าพารามิเตอร์ตัวที่ 2 เป็น false
exports.uploadPost = uploadHandler("Posts", true);
exports.uploadItem = uploadHandler("Items", true);
exports.uploadProject = uploadHandler("Projects", false);
exports.uploadProfile = uploadHandler("Profiles", false);
exports.uploadComment = uploadHandler("Comments", false);
exports.uploadCommunities = uploadHandler("Communities", true);
exports.uploadChat = uploadHandler("Chats", false);