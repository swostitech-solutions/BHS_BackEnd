const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const bookingServiceStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "bhs/booking-services",
    resource_type: "image",
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

module.exports = bookingServiceStorage;
