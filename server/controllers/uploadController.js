const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// 1. เปลี่ยนมาใช้ Memory Storage ของ Multer โดยตรง
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single("file");

const isModelFile = (filename) => {
  const lower = filename.toLowerCase();
  return lower.endsWith(".glb") || lower.endsWith(".gltf");
};

// 2. สร้าง Helper Function สำหรับ Upload Stream
const streamUpload = (fileBuffer, folder, isModel, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: isModel ? `${folder}/models` : `${folder}/Pictures`,
      // แก้ตรงนี้: 3D Model ใน Cloudinary ควรใช้ "image" หรือ "auto"
      resource_type: isModel ? "auto" : "image", 
      // ถ้าใช้ resource_type: "image" ไม่ต้องใส่ extension ใน public_id
      public_id: `${Date.now()}-${originalName.split('.')[0]}`,
      // ถ้าเป็นโมเดล ให้ระบุ format ชัดเจน
      format: isModel ? originalName.split('.').pop() : undefined
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });

    stream.end(fileBuffer);
  });
};

// 3. ปรับปรุง uploadHandler ใหม่
const uploadHandler = (baseFolder, allowModel = true) => [
  upload, // Middleware ของ multer
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const isModel = allowModel && isModelFile(req.file.originalname);
      
      // เรียกใช้ Stream Upload
      const result = await streamUpload(
        req.file.buffer, 
        baseFolder, 
        isModel, 
        req.file.originalname
      );

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

exports.uploadPost = uploadHandler("Posts", true);
exports.uploadItem = uploadHandler("Items", true);
exports.uploadProject = uploadHandler("Projects", false);
exports.uploadProfile = uploadHandler("Profiles", false);
exports.uploadComment = uploadHandler("Comments", false);