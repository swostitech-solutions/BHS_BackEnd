
const db = require("../../../models");
const SubService = db.SubService;
const Service = db.Service;
const { Op } = db.Sequelize;

/**
 * Generate subservice code
 * e.g. ACS10001 -> ACS10001-01
 */
const generateSubServiceCode = async (service_code) => {
  const lastSub = await SubService.findOne({
    where: {
      subservice_code: {
        [Op.like]: `${service_code}-%`,
      },
    },
    order: [["id", "DESC"]],
  });

  let nextNumber = 1;
  if (lastSub) {
    const lastNum = parseInt(lastSub.subservice_code.split("-")[1]);
    nextNumber = lastNum + 1;
  }

  return `${service_code}-${String(nextNumber).padStart(2, "0")}`;
};

/**
 * Helper → attach full image URL
 */


// const withImageUrl = (req, record) => {
//   const baseUrl = `${req.protocol}://${req.get("host")}`;
//   const json = record.toJSON(); // ✅ FIX

//   return {
//     ...json,
//     image: json.image ? baseUrl + json.image : null,
//     service_code: json.Service?.service_code || null,
//   };
// };

const withImageUrl = (req, record) => {
  const json = record.toJSON();

  return {
    ...json,

    // ✅ If already absolute (Cloudinary), return as-is
    image: json.image
      ? json.image.startsWith("http")
        ? json.image
        : `${req.protocol}://${req.get("host")}${json.image}`
      : null,

    service_code: json.Service?.service_code || null,
  };
};


// ============================
// CREATE SUBSERVICE
// ============================

exports.createSubService = async (req, res) => {
  try {
    let { name, description, price, service_code, serviceCode } = req.body;
    service_code = service_code || serviceCode;

    if (!name || !price || !service_code) {
      return res.status(400).json({
        message: "name, price, and service_code are required",
      });
    }

    // 🔹 Find parent service
    const service = await Service.findOne({ where: { service_code } });
    if (!service) {
      return res.status(404).json({ message: "Parent service not found" });
    }

    // 🔹 Generate subservice code
    const subservice_code = await generateSubServiceCode(service_code);

    // 🔹 Handle image
    // const image = req.file ? `/uploads/subservices/${req.file.filename}` : null;
    const image = req.file?.path; // Cloudinary URL

    // 🔹 Create subservice
    const createdSubservice = await SubService.create({
      subservice_code,
      name,
      description,
      price,
      image,
      service_id: service.id,
    });

    // 🔹 Fetch again with Service to include service_code in response
    const subserviceWithService = await SubService.findByPk(
      createdSubservice.id,
      {
        include: [{ model: Service, attributes: ["service_code"] }],
      }
    );

    return res.status(201).json({
      message: "SubService created successfully",
      subservice: withImageUrl(req, subserviceWithService),
    });
  } catch (err) {
    console.error("CREATE SUBSERVICE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ============================
// GET ALL SUBSERVICES
// ============================
exports.getAllSubServices = async (req, res) => {
  try {
    // const data = await SubService.findAll({
    //   include: [{ model: Service, attributes: ["id", "name"] }],
    // });
    const data = await SubService.findAll({
      include: [{ model: Service, attributes: ["id", "name", "service_code"] }],
    });


    const result = data.map((s) => withImageUrl(req, s));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================
// GET SUBSERVICE BY ID
// ============================


exports.getSubServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const subservice = await SubService.findByPk(id, {
      include: [
        {
          model: Service,
          attributes: ["id", "service_code", "name"],
        },
      ],
    });

    if (!subservice) {
      return res.status(404).json({ message: "SubService not found" });
    }

    // 🔹 Format response with explicit service_code
    const data = {
      ...withImageUrl(req, subservice),
      service_code: subservice.Service?.service_code || null,
      service_name: subservice.Service?.name || null,
    };

    return res.json({
      message: "SubService fetched successfully",
      data,
    });
  } catch (err) {
    console.error("GET SUBSERVICE BY ID ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// GET BY SERVICE CODE
// ============================

exports.getByServiceCode = async (req, res) => {
  try {
    const { serviceCode } = req.params;

    const service = await Service.findOne({
      where: { service_code: serviceCode },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const subservices = await SubService.findAll({
      where: { service_id: service.id },
      include: [
        {
          model: Service,
          attributes: ["service_code"],
        },
      ],
    });

    const result = subservices.map((s) => withImageUrl(req, s));

    return res.json({
      message: "SubServices fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("GET SUBSERVICES BY SERVICE CODE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ============================
// GET BY SUBSERVICE CODE
// ============================

exports.getByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const subservice = await SubService.findOne({
      where: { subservice_code: code },
      include: [
        {
          model: Service,
          attributes: ["service_code"],
        },
      ],
    });

    if (!subservice) {
      return res.status(404).json({ message: "SubService not found" });
    }

    return res.json(withImageUrl(req, subservice));
  } catch (err) {
    console.error("GET SUBSERVICE BY CODE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// ============================
// UPDATE SUBSERVICE (FIXED)
// ============================
exports.updateSubService = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      name,
      description,
      price,
      service_code, // incoming parent service code
    } = req.body;

    const subservice = await SubService.findByPk(id);
    if (!subservice) {
      return res.status(404).json({ message: "SubService not found" });
    }

    // 🔹 Handle image
    // const image = req.file
    //   ? `/uploads/subservices/${req.file.filename}`
    //   : subservice.image;
    const image = req.file?.path; // Cloudinary URL

    let updateData = {
      name,
      description,
      price,
      image,
    };

    // 🔹 If service_code is changed → update service_id + regenerate subservice_code
    if (service_code) {
      const service = await Service.findOne({
        where: { service_code },
      });

      if (!service) {
        return res.status(404).json({
          message: "Parent service not found",
        });
      }

      const newSubServiceCode = await generateSubServiceCode(service_code);

      updateData.service_id = service.id;
      updateData.subservice_code = newSubServiceCode;
    }

    await subservice.update(updateData);

    return res.json({
      message: "SubService updated successfully",
      data: withImageUrl(req, subservice),
    });
  } catch (err) {
    console.error("UPDATE SUBSERVICE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ============================
// DELETE SUBSERVICE
// ============================
exports.deleteSubService = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SubService.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "SubService not found" });
    }

    res.json({ message: "SubService deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
