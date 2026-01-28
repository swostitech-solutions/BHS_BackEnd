// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("./cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let folder = "bhs/uploads";

//     if (file.fieldname === "profileImage") folder += "/profile";
//     else if (file.fieldname.includes("Doc")) folder += "/documents";

//     return {
//       folder,
//       resource_type: "auto",
//       format: undefined, // keep original
//       public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
//     };
//   },
// });

// module.exports = storage;




// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("./cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const isPdf = file.mimetype === "application/pdf";

//     return {
//       folder: isPdf ? "bhs/uploads/documents" : "bhs/uploads/images",

//       resource_type: isPdf ? "raw" : "image",

//       // ❌ DO NOT add fl_attachment
//       // ❌ DO NOT set disposition

//       public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
//     };
//   },
// });

// module.exports = storage;






//// resourse :auto

// src/config/cloudinaryStorage.js

// const { CloudinaryStorage } = require("multer-storage-cloudinary"); // ✅ import this
// const cloudinary = require("./cloudinary"); // your cloudinary config

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const isPdf = file.mimetype === "application/pdf";

//     return {
//       folder: isPdf ? "bhs/uploads/documents" : "bhs/uploads/images",
//       resource_type: "auto", // allow browser view for PDFs/images
//       public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
//     };
//   },
// });

// module.exports = storage;







// config/cloudinaryStorage.js
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: isPdf
        ? "bhs/uploads/documents"
        : "bhs/uploads/images",

      resource_type: isPdf ? "raw" : "image", // ✅ CORRECT

      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

      // ✅ VERY IMPORTANT
      format: isPdf ? "pdf" : undefined,
    };
  },
});

module.exports = storage;
