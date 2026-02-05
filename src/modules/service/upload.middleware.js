// ===================================
// BOOKING SERVICE UPLOAD - Auto-detect Cloudinary vs Local Storage
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

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

if (useCloudinary) {
  const bookingServiceStorage = require("../../config/cloudinaryBookingStorage");

  upload = multer({
    storage: bookingServiceStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("📦 Booking service uploads: Using Cloudinary storage");
} else {
  const uploadDir = path.join(process.cwd(), "uploads/booking-services");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("📦 Booking service uploads: Using local disk storage (Cloudinary not configured)");
}

module.exports = upload;
