const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// เก็บไฟล์เข้า ram server
const storage = multer.memoryStorage(); // 3
const upload = multer({ // 2
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // จำกัดขนาด 10MB
}).single("file");

// 1 ตัวอัปโหลดใหญ่
const uploadHandler = (baseFolder, allowModel = true) => [
  upload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const isModel = allowModel && isModelFile(req.file.originalname);

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

// 4 เช็คว่าเป็นโมเดลไหม
const isModelFile = (filename) => {
  const lower = filename.toLowerCase();
  return lower.endsWith(".glb") || lower.endsWith(".zip"); // ใช่ 2 อันนี้ไหม true/false
};

// 5 
const streamUpload = (fileBuffer, folder, isModel, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: isModel ? `${folder}/models` : `${folder}/Pictures`,
      resource_type: isModel ? "raw" : "image",
      public_id: `${Date.now()}-${originalName.split('.')[0]}`,
      format: isModel ? originalName.split('.').pop() : undefined
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });

    stream.end(fileBuffer);
  });
};



exports.uploadPost = uploadHandler("Posts", true);
exports.uploadItem = uploadHandler("Items", true);
exports.uploadProject = uploadHandler("Projects", false);
exports.uploadProfile = uploadHandler("Profiles", false);
exports.uploadComment = uploadHandler("Comments", false);
exports.uploadCommunities = uploadHandler("Communities", true);
exports.uploadChat = uploadHandler("Chats", false);