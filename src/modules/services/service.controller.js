

const db = require("../../../models");
const Service = db.Service;
const { Op } = db.Sequelize;

const resolveImageUrl = (req, image) => {
  if (!image) return null;

  // Cloudinary or any absolute URL
  if (image.startsWith("http")) return image;

  // Legacy local uploads (if any)
  return `${req.protocol}://${req.get("host")}${image}`;
};


/**
 * Generate auto service code like AC10001, HC20001
 */
const generateServiceCode = async (name) => {
  const prefix = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const lastService = await Service.findOne({
    where: {
      service_code: { [Op.like]: `${prefix}%` },
    },
    order: [["id", "DESC"]],
  });

  let nextNumber = 10001;
  if (lastService) {
    const lastNum = parseInt(lastService.service_code.replace(prefix, ""));
    nextNumber = lastNum + 1;
  }

  return `${prefix}${nextNumber}`;
};

/**
 * CREATE SERVICE
 */
exports.createService = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const service_code = await generateServiceCode(name);

    // ✅ store relative path
    // const image = req.file ? `/uploads/services/${req.file.filename}` : null;

    const image = req.file?.path; // Cloudinary URL

    const service = await Service.create({
      service_code,
      name,
      description,
      image,
    });

    return res.status(201).json({
      message: "Service created successfully",
      data: service,
    });
  } catch (err) {
    console.error("CREATE SERVICE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL SERVICES
 */
exports.getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["id", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // ✅ attach full image URL
    // const data = services.map((service) => ({
    //   ...service.toJSON(),
    //   image: service.image ? baseUrl + service.image : null,
    // }));

    const data = services.map((service) => ({
      ...service.toJSON(),
      image: resolveImageUrl(req, service.image),
    }));

    return res.json({
      message: "Services fetched successfully",
      data,
    });
  } catch (err) {
    console.error("GET SERVICES ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET SERVICE BY ID
 */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // return res.json({
    //   ...service.toJSON(),
    //   image: service.image ? baseUrl + service.image : null,
    // });
    return res.json({
      ...service.toJSON(),
      image: resolveImageUrl(req, service.image),
    });
  } catch (err) {
    console.error("GET SERVICE BY ID ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE SERVICE
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (name) service.name = name;
    if (description) service.description = description;

    // ✅ replace image if new file uploaded
    // if (req.file) {
    //   service.image = `/uploads/services/${req.file.filename}`;
    // }
    if (req.file) {
      service.image = req.file.path; // ✅ Cloudinary URL
    }

    await service.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.json({
      message: "Service updated successfully",
      data: {
        ...service.toJSON(),
        // image: service.image ? baseUrl + service.image : null,
        image: resolveImageUrl(req, service.image),
      },
    });
  } catch (err) {
    console.error("UPDATE SERVICE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE SERVICE
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.destroy();

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("DELETE SERVICE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};
