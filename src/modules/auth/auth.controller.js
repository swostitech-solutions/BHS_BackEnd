const bcrypt = require("bcrypt");
const db = require("../../../models");
const User = db.User;
const Technician = db.Technician;
const sequelize = db.sequelize;
const { generateAccessToken, generateRefreshToken } = require("../../utils/token");


const getBaseUrl = (req) => `${req.protocol}://${req.get("host")}`;

const withBaseUrl = (req, path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; // safety
  return `${getBaseUrl(req)}${path}`;
};



const hashPass = (pwd) => bcrypt.hash(pwd, 10);

const getRoleName = (roleId) => {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Client";
    case 3:
      return "Technician";
    default:
      return "Unknown";
  }
};


const ensureDefaultAdmin = async () => {
  try {
    const [admin, created] = await User.findOrCreate({
      where: { username: "Admin" },
      defaults: {
        name: "System Admin",
        email: "admin@example.com",
        mobile: "0000000000",
        address: "Head Office",
        password: await hashPass("Admin"),
        roleId: 1,
      },
    });

    if (created) {
      console.log("✔ Default Admin created (username: Admin, password: Admin)");
    } else {
      console.log("ℹ Default Admin already exists");
    }

    return admin;
  } catch (err) {
    console.error("❌ Failed to ensure default admin:", err);
    throw err;
  }
};


/* -------- Client Signup -------- */
exports.signupClient = async (req, res) => {
  try {
    const { name, email, mobile, username, password, address } = req.body;

    const exists = await User.findOne({ where: { username } });
    if (exists)
      return res.status(400).json({ message: "Username already exists" });

    const roleId = 2;

    const user = await User.create({
      name,
      email,
      mobile,
      address,
      username,
      password: await hashPass(password),
      roleId,
    });

    res.status(201).json({
      message: "Client registered",
      user: { ...user.toJSON(), roleName: getRoleName(roleId) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




///// client Update /////
exports.updateClientProfile = async (req, res) => {
  try {
    const { userId, name, email, mobile, address } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findByPk(userId);
    if (!user || user.roleId !== 2) {
      return res.status(404).json({ message: "Client not found" });
    }

    /* ---------------- EMAIL UNIQUENESS CHECK ---------------- */
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    /* ---------------- PROFILE IMAGE ---------------- */
    const profileImage = req.file
      ? `/uploads/clients/${req.file.filename}`
      : user.profileImage;

    /* ---------------- UPDATE USER ---------------- */
    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      mobile: mobile ?? user.mobile,
      address: address ?? user.address,
      profileImage,
    });

    /* ---------------- RESPONSE (FULL URL) ---------------- */
    return res.json({
      message: "Client profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,

        // ✅ FULL IMAGE URL
        profileImage: withBaseUrl(req, user.profileImage),
      },
    });
  } catch (err) {
    console.error("UPDATE CLIENT PROFILE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};














/* -------- Technician Signup -------- */
exports.signupTechnician = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      username,
      password,
      address,
      skill,
      experience,
      aadharCardNo,
      panCardNo,
      bankName,
      ifscNo,
      branchName,
      timeDuration,
      emergencyAvailable = false,
      techCategory,
    } = req.body;

    // ✅ Required field check
    if (!name || !username || !password || !skill || !experience || !techCategory) {
      return res.status(400).json({ 
        message: "Missing required fields. Please provide name, username, password, skill, experience, and service category." 
      });
    }

    // ✅ Check if username already exists
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const roleId = 3;

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      mobile,
      address,
      username,
      password: await hashPass(password),
      roleId,
    });

    // ✅ Helper to get relative file paths
    const files = req.files || {};
    const getFilePath = (field) =>
      files[field]?.[0]
        ? `/uploads/technicians/${files[field][0].filename}`
        : null;

    // ✅ Create technician
    const technician = await Technician.create({
      userId: user.id,
      skill,
      experience: Number(experience),
      aadharCardNo,
      panCardNo,
      bankName,
      ifscNo,
      branchName,
      timeDuration,
      emergencyAvailable,
      techCategory,
      status: "PENDING",

      profileImage: getFilePath("profileImage"),
      aadharDoc: getFilePath("aadharDoc"),
      panDoc: getFilePath("panDoc"),
      bankPassbookDoc: getFilePath("bankPassbookDoc"),
      experienceCertDoc: getFilePath("experienceCertDoc"),
    });

    // ✅ Send response
    return res.status(201).json({
      message: "Technician registered successfully, pending approval",
      data: {
        userId: user.id,
        name: user.name,
        username: user.username,
        roleName: getRoleName(roleId),
        technician: {
          skill: technician.skill,
          experience: technician.experience,
          aadharCardNo: technician.aadharCardNo,
          panCardNo: technician.panCardNo,
          bankName: technician.bankName,
          ifscNo: technician.ifscNo,
          branchName: technician.branchName,
          status: technician.status,
          timeDuration: technician.timeDuration,
          emergencyAvailable: technician.emergencyAvailable,
          techCategory: technician.techCategory,
          profileImage: withBaseUrl(req, technician.profileImage),
          aadharDoc: withBaseUrl(req, technician.aadharDoc),
          panDoc: withBaseUrl(req, technician.panDoc),
          bankPassbookDoc: withBaseUrl(req, technician.bankPassbookDoc),
          experienceCertDoc: withBaseUrl(req, technician.experienceCertDoc),
        },
      },
    });
  } catch (err) {
    console.error("SIGNUP TECHNICIAN ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};








//// Technician Update //////
exports.updateTechnicianProfile = async (req, res) => {
  try {
    const { userId, name, email, mobile, address } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    /* ---------------- FIND USER ---------------- */
    const user = await User.findByPk(userId);
    if (!user || user.roleId !== 3) {
      return res.status(404).json({ message: "Technician user not found" });
    }

    /* ---------------- EMAIL DUPLICATE CHECK ---------------- */
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use by another account",
        });
      }
    }

    /* ---------------- FIND TECHNICIAN ---------------- */
    const technician = await Technician.findOne({ where: { userId } });
    if (!technician) {
      return res.status(404).json({ message: "Technician profile not found" });
    }

    /* ---------------- FILES ---------------- */
    const files = req.files || {};
    const getFilePath = (field) =>
      files[field]?.[0]
        ? `/uploads/technicians/${files[field][0].filename}`
        : undefined;

    /* ---------------- UPDATE USER ---------------- */
    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      mobile: mobile ?? user.mobile,
      address: address ?? user.address,
    });

    /* ---------------- UPDATE TECHNICIAN ---------------- */
    await technician.update({
      skill: req.body.skill ?? technician.skill,
      experience: req.body.experience ?? technician.experience,
      aadharCardNo: req.body.aadharCardNo ?? technician.aadharCardNo,
      panCardNo: req.body.panCardNo ?? technician.panCardNo,
      bankName: req.body.bankName ?? technician.bankName,
      ifscNo: req.body.ifscNo ?? technician.ifscNo,
      branchName: req.body.branchName ?? technician.branchName,
      timeDuration: req.body.timeDuration ?? technician.timeDuration,
      emergencyAvailable:
        req.body.emergencyAvailable ?? technician.emergencyAvailable,
      techCategory: req.body.techCategory ?? technician.techCategory,

      profileImage: getFilePath("profileImage") ?? technician.profileImage,
      aadharDoc: getFilePath("aadharDoc") ?? technician.aadharDoc,
      panDoc: getFilePath("panDoc") ?? technician.panDoc,
      bankPassbookDoc:
        getFilePath("bankPassbookDoc") ?? technician.bankPassbookDoc,
      experienceCertDoc:
        getFilePath("experienceCertDoc") ?? technician.experienceCertDoc,
    });

    return res.json({
      message: "Technician profile updated successfully",
    });
  } catch (err) {
    console.error("UPDATE TECHNICIAN PROFILE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};







/* -------- Login (Common for Admin / Client / Technician) -------- */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({
      where: { username },
      include: [{ model: Technician, as: "technician", required: false }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tech = user.technician;

    // Allow pending technicians to login but flag their status
    const isPendingTechnician = user.roleId === 3 && tech?.status === "PENDING";
    const isRejectedTechnician = user.roleId === 3 && tech?.status === "REJECT";

    // Block rejected technicians
    if (isRejectedTechnician) {
      return res.status(403).json({
        message: "Your technician application has been rejected. Please contact support.",
        status: tech.status,
      });
    }

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      username: user.username,
      roleId: user.roleId,
      roleName: getRoleName(user.roleId),
      profileImage: withBaseUrl(req, user.profileImage),

      technicianDetails:
        user.roleId === 3 && tech
          ? {
              skill: tech.skill ?? null,
              experience: tech.experience ?? null,
              aadharCardNo: tech.aadharCardNo ?? null,
              panCardNo: tech.panCardNo ?? null,
              bankName: tech.bankName ?? null,
              ifscNo: tech.ifscNo ?? null,
              branchName: tech.branchName ?? null,
              status: tech.status ?? "PENDING",
              timeDuration: tech.timeDuration ?? null,
              emergencyAvailable: tech.emergencyAvailable ?? false,
              techCategory: tech.techCategory ?? null,

              // ✅ FULL URLs
              profileImage: withBaseUrl(req, tech.profileImage),
              aadharDoc: withBaseUrl(req, tech.aadharDoc),
              panDoc: withBaseUrl(req, tech.panDoc),
              bankPassbookDoc: withBaseUrl(req, tech.bankPassbookDoc),
              experienceCertDoc: withBaseUrl(req, tech.experienceCertDoc),

              rating: {
                avg_rating: tech.avg_rating ?? "0.0",
                rating_count: tech.rating_count ?? 0,
              },
            }
          : null,
    };

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, role: user.roleId });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Create or update user session
    await sequelize.query(
      `INSERT INTO user_sessions (user_id, role_id, access_token, refresh_token, created_at, updated_at)
       VALUES (:userId, :roleId, :accessToken, :refreshToken, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET access_token = :accessToken, refresh_token = :refreshToken, updated_at = NOW()`,
      {
        replacements: {
          userId: user.id,
          roleId: user.roleId,
          accessToken,
          refreshToken,
        },
      }
    );

    res.json({ 
      message: "Login successful", 
      user: responseUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("LOGIN ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




/* -------- Logout (Stateless) -------- */
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body ?? {};

    // Optional: Not mandatory, only for logging purpose
    if (userId) {
      console.log(`User logged out → ID: ${userId}`);
    }

    return res.json({
      message: "Logout successful",
      loggedOut: true,
    });
  } catch (err) {
    console.error("LOGOUT ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




/* -------- Get All Users (Admin Included) -------- */
exports.getAllUsers = async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const users = await User.findAll({
      include: [{ model: Technician, as: "technician", required: false }],
      order: [["id", "ASC"]],
    });

    const result = users.map((u) => {
      const user = u.toJSON();
      const tech = user.technician;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        username: user.username,
        roleId: user.roleId,
        roleName: getRoleName(user.roleId),
        profileImage: withBaseUrl(req, user.profileImage),

        technician:
          user.roleId === 3 && tech
            ? {
                skill: tech.skill ?? null,
                experience: tech.experience ?? null,
                aadharCardNo: tech.aadharCardNo ?? null,
                panCardNo: tech.panCardNo ?? null,
                bankName: tech.bankName ?? null,
                ifscNo: tech.ifscNo ?? null,
                branchName: tech.branchName ?? null,
                status: tech.status ?? "PENDING",
                timeDuration: tech.timeDuration ?? null,
                emergencyAvailable: tech.emergencyAvailable ?? false,
                techCategory: tech.techCategory ?? null,

                profileImage: withBaseUrl(req, tech.profileImage),
                aadharDoc: withBaseUrl(req, tech.aadharDoc),
                panDoc: withBaseUrl(req, tech.panDoc),
                bankPassbookDoc: withBaseUrl(req, tech.bankPassbookDoc),
                experienceCertDoc: withBaseUrl(req, tech.experienceCertDoc),

                rating: {
                  avg_rating: tech.avg_rating ?? "0.0",
                  rating_count: tech.rating_count ?? 0,
                },
              }
            : null,
      };
    });

    res.status(200).json({
      message: "Users fetched successfully",
      total: result.length,
      data: result,
    });
  } catch (err) {
    console.error("GET ALL USERS ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};






/**
 * @desc Admin approves or rejects a technician
 * @route PATCH /api/auth/technician/:id/status
 * @access Admin only
 */
exports.updateTechnicianStatus = async (req, res) => {
  try {
    // Check if user is admin (roleId = 1)
    if (req.user?.role !== 1) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { id } = req.params; // userId of technician
    const { status } = req.body; // APPROVE / REJECT

    const mapStatus = {
      APPROVE: "ACCEPT",
      REJECT: "REJECT",
    };

    const newStatus = mapStatus[status?.toUpperCase()];
    if (!newStatus) {
      return res.status(400).json({
        message: "Invalid status. Use APPROVE or REJECT",
      });
    }

    const technician = await Technician.findOne({ where: { userId: id } });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    await technician.update({ status: newStatus });

    const user = await User.findByPk(id, {
      include: [{ model: Technician, as: "technician" }],
    });

    return res.json({
      message: `Technician status updated to ${newStatus}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: getRoleName(user.roleId),
        technicianDetails: {
          ...user.technician.toJSON(),
        },
      },
    });
  } catch (err) {
    console.error("UPDATE TECHNICIAN STATUS ERROR →", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};





/* -------- Get Single User by ID -------- */

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: Technician, as: "technician", required: false }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const tech = user.technician;

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      username: user.username,
      roleId: user.roleId,
      roleName: getRoleName(user.roleId),
      profileImage: withBaseUrl(req, user.profileImage),

      technicianDetails:
        user.roleId === 3 && tech
          ? {
              skill: tech.skill ?? null,
              experience: tech.experience ?? null,
              aadharCardNo: tech.aadharCardNo ?? null,
              panCardNo: tech.panCardNo ?? null,
              bankName: tech.bankName ?? null,
              ifscNo: tech.ifscNo ?? null,
              branchName: tech.branchName ?? null,
              status: tech.status ?? "PENDING",
              timeDuration: tech.timeDuration ?? null,
              emergencyAvailable: tech.emergencyAvailable ?? false,
              techCategory: tech.techCategory ?? null,

              // ✅ FULL URLs
              profileImage: withBaseUrl(req, tech.profileImage),
              aadharDoc: withBaseUrl(req, tech.aadharDoc),
              panDoc: withBaseUrl(req, tech.panDoc),
              bankPassbookDoc: withBaseUrl(req, tech.bankPassbookDoc),
              experienceCertDoc: withBaseUrl(req, tech.experienceCertDoc),

              rating: {
                avg_rating: tech.avg_rating ?? "0.0",
                rating_count: tech.rating_count ?? 0,
              },
            }
          : null,
    };

    res.json({ message: "User fetched successfully", user: responseUser });
  } catch (err) {
    console.error("GET USER BY ID ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};







/* -------- Get User by ID and Role (User-only) -------- */
exports.getUserByRole = async (req, res) => {
  try {
    const { id, roleId } = req.params;

    // If roleId is 3 (Technician), do NOT show data
    if (Number(roleId) === 3) {
      return res.status(404).json({
        message: "No user data available for this role",
        user: null,
      });
    }

    const user = await User.findOne({ where: { id, roleId } });
    if (!user) {
      return res.status(404).json({ message: "User not found with the given role" });
    }

    // Only user data, no technician details
    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      username: user.username,
      roleId: user.roleId,
      roleName: getRoleName(user.roleId),
      profileImage: withBaseUrl(req, user.profileImage),
    };

    return res.json({
      message: "User fetched successfully",
      user: responseUser,
    });
  } catch (err) {
    console.error("GET USER BY ROLE ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};




/* -------- Get Technician by technicianId and roleId -------- */

exports.getTechnicianByRole = async (req, res) => {
  try {
    const { id, roleId } = req.params;

    if (Number(roleId) !== 3) {
      return res
        .status(400)
        .json({ message: "Role must be Technician (roleId=3)" });
    }

    const user = await User.findOne({
      where: { id, roleId: 3 },
      include: [{ model: Technician, as: "technician", required: true }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Technician not found with the given role" });
    }

    const tech = user.technician;

    const responseTech = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      username: user.username,
      roleId: user.roleId,
      roleName: getRoleName(user.roleId),

      technicianDetails: {
        skill: tech.skill ?? null,
        experience: tech.experience ?? null,
        aadharCardNo: tech.aadharCardNo ?? null,
        panCardNo: tech.panCardNo ?? null,
        bankName: tech.bankName ?? null,
        ifscNo: tech.ifscNo ?? null,
        branchName: tech.branchName ?? null,
        status: tech.status ?? "PENDING",
        timeDuration: tech.timeDuration ?? null,
        emergencyAvailable: tech.emergencyAvailable ?? false,
        techCategory: tech.techCategory ?? null,

        // ✅ FULL URLs
        profileImage: withBaseUrl(req, tech.profileImage),
        aadharDoc: withBaseUrl(req, tech.aadharDoc),
        panDoc: withBaseUrl(req, tech.panDoc),
        bankPassbookDoc: withBaseUrl(req, tech.bankPassbookDoc),
        experienceCertDoc: withBaseUrl(req, tech.experienceCertDoc),

        rating: {
          avg_rating: tech.avg_rating ?? "0.0",
          rating_count: tech.rating_count ?? 0,
        },
      },
    };

    res.json({
      message: "Technician fetched successfully",
      technician: responseTech,
    });
  } catch (err) {
    console.error("GET TECHNICIAN BY ROLE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};
