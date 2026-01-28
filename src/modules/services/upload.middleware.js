
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure upload folder exists
// const uploadPath = "uploads/services";
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },

//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname); // 👈 safer
//     cb(null, `${unique}${ext}`);
//   },
// });

// // Optional: file type validation (recommended)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|webp/;
//   const ext = path.extname(file.originalname).toLowerCase();
//   const mime = file.mimetype;

//   if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed"));
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

// module.exports = upload;





const multer = require("multer");
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

// Optional: file type validation (same behavior as before)
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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
