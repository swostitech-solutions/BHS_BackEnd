// // clientUploads.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const uploadPath = path.join(process.cwd(), "uploads/clients");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => cb(null, uploadPath),
//   filename: (_, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const uploadClient = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
// }).single("profileImage");

// module.exports = uploadClient;







const multer = require("multer");
const cloudinaryStorage = require("../../config/cloudinaryStorage");

const uploadClient = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profileImage");

module.exports = uploadClient;
