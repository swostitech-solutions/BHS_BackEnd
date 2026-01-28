
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// /**
//  * ✅ IMPORTANT
//  * Files MUST go to project-root/uploads/technicians
//  * (Same level as uploads/services & uploads/subServices)
//  */

// // Absolute path (safe & recommended)
// const uploadPath = path.join(process.cwd(), "uploads/technicians");

// // Ensure upload folder exists
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// // Storage config (same style as services)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },

//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, `${unique}${ext}`);
//   },
// });

// // ✅ File filter (images + pdf only)
// const fileFilter = (req, file, cb) => {
//   const allowedExt = /jpeg|jpg|png|webp|pdf/;
//   const ext = path.extname(file.originalname).toLowerCase();
//   const mime = file.mimetype;

//   if (allowedExt.test(ext) && allowedExt.test(mime)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images (jpg, png, webp) and PDFs are allowed"));
//   }
// };

// // ✅ Multer middleware (multiple fields)
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// }).fields([
//   { name: "profileImage", maxCount: 1 },
//   { name: "aadharDoc", maxCount: 1 },
//   { name: "panDoc", maxCount: 1 },
//   { name: "bankPassbookDoc", maxCount: 1 },
//   { name: "experienceCertDoc", maxCount: 1 },
// ]);

// module.exports = upload;




const multer = require("multer");
const cloudinaryStorage = require("../../config/cloudinaryStorage");

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "profileImage", maxCount: 1 },
  { name: "aadharDoc", maxCount: 1 },
  { name: "panDoc", maxCount: 1 },
  { name: "bankPassbookDoc", maxCount: 1 },
  { name: "experienceCertDoc", maxCount: 1 },
]);

module.exports = upload;
