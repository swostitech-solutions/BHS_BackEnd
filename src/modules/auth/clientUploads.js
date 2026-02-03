// ===================================
// CLIENT UPLOADS - Auto-detect Cloudinary vs Local Storage
// ===================================
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if Cloudinary is configured
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadClient;

if (useCloudinary) {
  const cloudinaryStorage = require("../../config/cloudinaryStorage");
  uploadClient = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("profileImage");

  console.log("📦 Client uploads: Using Cloudinary storage");
} else {
  const uploadPath = path.join(process.cwd(), "uploads/clients");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadPath),
    filename: (_, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  uploadClient = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("profileImage");

  console.log("📦 Client uploads: Using local disk storage (Cloudinary not configured)");
}

module.exports = uploadClient;
