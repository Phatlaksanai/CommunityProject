const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const isModelFile = (filename) => {  // ตรวจสอบไฟล์ 3D
  const lower = filename.toLowerCase();
  return lower.endsWith(".glb") || lower.endsWith(".gltf");
};

const createStorage = (baseFolder, allowModel = true) => // สร้าง Cloudinary storage แบบ dynamic
  new CloudinaryStorage({ 
    cloudinary,
    params: async (req, file) => {
      const isModel = allowModel && isModelFile(file.originalname);

      return {
        folder: isModel
          ? `${baseFolder}/models`
          : `${baseFolder}/Pictures`,

        resource_type: isModel ? "raw" : "image",

        public_id: isModel
          ? `${Date.now()}-${file.originalname}`
          : `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,

        allowed_formats: isModel
          ? ["glb", "gltf"]
          : ["jpg", "jpeg", "png", "gif"],
      };
    },
  });

const createUploader = (folder, allowModel = true) => // สร้าง multer uploader
  multer({
    storage: createStorage(folder, allowModel),
    limits: { fileSize: 10 * 1024 * 1024 }, 
  }).single("file");

const uploadHandler = (folder, allowModel = true) => [ 
  createUploader(folder, allowModel),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.status(200).json({
        url: req.file.path,
        public_id: req.file.filename,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  },
];

exports.uploadPost = uploadHandler("Posts", true);
exports.uploadItem = uploadHandler("Items", true);
exports.uploadProject = uploadHandler("Projects", false);
