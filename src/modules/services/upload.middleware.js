// ===================================
// SERVICES UPLOAD - Auto-detect Cloudinary vs Local Storage
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

let upload;

if (useCloudinary) {
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinary = require("../../config/cloudinary");

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: "bhs/services",
      resource_type: "image",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, png, webp) are allowed"));
    }
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("📦 Services uploads: Using Cloudinary storage");
} else {
  const uploadPath = path.join(process.cwd(), "uploads/services");

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("📦 Services uploads: Using local disk storage (Cloudinary not configured)");
}

module.exports = upload;
