// ===================================
// LOCAL STORAGE (for development without Cloudinary)
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
  // ===================================
  // CLOUDINARY STORAGE (for production)
  // ===================================
  const cloudinaryStorage = require("../../config/cloudinaryStorage");

  upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadharDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "bankPassbookDoc", maxCount: 1 },
    { name: "experienceCertDoc", maxCount: 1 },
  ]);

  console.log("📦 Auth uploads: Using Cloudinary storage");
} else {
  // ===================================
  // LOCAL DISK STORAGE (for development)
  // ===================================
  const uploadPath = path.join(process.cwd(), "uploads/technicians");

  // Ensure upload folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedExt = /jpeg|jpg|png|webp|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedExt.test(ext) || mime.startsWith("image/") || mime === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpg, png, webp) and PDFs are allowed"));
    }
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "aadharDoc", maxCount: 1 },
    { name: "panDoc", maxCount: 1 },
    { name: "bankPassbookDoc", maxCount: 1 },
    { name: "experienceCertDoc", maxCount: 1 },
  ]);

  console.log("📦 Auth uploads: Using local disk storage (Cloudinary not configured)");
}

module.exports = upload;
