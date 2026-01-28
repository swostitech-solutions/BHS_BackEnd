// const db = require("../../models");
const db = require("../../../models");


const Feedback = db.Feedback;
const Technician = db.Technician;
const User = db.User;



// Cretae feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      user_id,
      technician_id, // <-- this is User.id coming from frontend
      rating,
      comment,
      service_code,
      subservice_code,
    } = req.body;

    if (!user_id || !technician_id || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔍 Find technician by userId
    const technician = await db.Technician.findOne({
      where: { userId: technician_id },
    });

    if (!technician) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    // ✅ Save feedback using technicians.id
    await db.Feedback.create({
      user_id,
      technician_id: technician.id, // ✅ FIXED
      rating,
      comment,
      service_code,
      subservice_code,
    });

    // 🔄 Recalculate rating
    const stats = await db.Feedback.findAll({
      where: { technician_id: technician.id },
      attributes: [
        [db.sequelize.fn("AVG", db.sequelize.col("rating")), "avg"],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
      ],
      raw: true,
    });

    const avgRating = Number(stats[0].avg || 0).toFixed(1);
    const count = Number(stats[0].count || 0);

    // 🔥 Update technician master rating
    await db.Technician.update(
      {
        avg_rating: avgRating,
        rating_count: count,
      },
      {
        where: { id: technician.id },
      }
    );

    res.status(201).json({
      message: "Feedback submitted successfully",
      rating: avgRating,
      rating_count: count,
    });
  } catch (err) {
    console.error("CREATE FEEDBACK ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};



// get all feedback

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await db.Feedback.findAll({
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "username"],
        },
        {
          model: db.Technician,
          include: [
            {
              model: db.User,
              as: "user",
              attributes: [
                "id",
                "name",
                "email",
                "mobile",
                "address",
                "username",
                "roleId",
              ],
            },
          ],
          attributes: ["avg_rating", "rating_count"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 🔁 FORMAT RESPONSE
    const formatted = feedbacks.map((f) => {
      const data = f.toJSON();

      let technician = null;
      let technician_user_id = null;

      if (data.Technician && data.Technician.user) {
        const u = data.Technician.user;

        technician_user_id = u.id;

        technician = {
          id: u.id, // ✅ User.id (15)
          name: u.name,
          email: u.email,
          mobile: u.mobile,
          address: u.address,
          username: u.username,
          roleId: u.roleId,
          roleName: "Technician",
          rating: {
            avg_rating: data.Technician.avg_rating,
            rating_count: data.Technician.rating_count,
          },
        };
      }

      return {
        id: data.id,
        user_id: data.user_id,
        technician_id: technician_user_id, // ✅ FIXED
        rating: data.rating,
        comment: data.comment,
        service_code: data.service_code,
        subservice_code: data.subservice_code,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        user: data.User,
        technician,
      };
    });

    res.status(200).json({ feedbacks: formatted });
  } catch (err) {
    console.error("GET ALL FEEDBACK ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};



// get feedback by technician ID (updated to match getAllFeedbacks response)
exports.getFeedbackByTechnician = async (req, res) => {
  try {
    const { technician_id } = req.params; // userId

    // Find technician by userId
    const technician = await db.Technician.findOne({
      where: { userId: technician_id },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: [
            "id",
            "name",
            "email",
            "mobile",
            "address",
            "username",
            "roleId",
          ],
        },
      ],
    });

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Fetch feedbacks for this technician using technician.id (PK)
    const feedbacks = await db.Feedback.findAll({
      where: { technician_id: technician.id },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format feedbacks same as getAllFeedbacks
    const formatted = feedbacks.map((f) => {
      const data = f.toJSON();

      let techData = null;
      let technician_user_id = null;

      if (technician.user) {
        const u = technician.user;
        technician_user_id = u.id;

        techData = {
          id: u.id,
          name: u.name,
          email: u.email,
          mobile: u.mobile,
          address: u.address,
          username: u.username,
          roleId: u.roleId,
          roleName: "Technician",
          rating: {
            avg_rating: technician.avg_rating,
            rating_count: technician.rating_count,
          },
        };
      }

      return {
        id: data.id,
        user_id: data.user_id,
        technician_id: technician_user_id,
        rating: data.rating,
        comment: data.comment,
        service_code: data.service_code,
        subservice_code: data.subservice_code,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        user: data.User,
        technician: techData,
      };
    });

    res.status(200).json({ feedbacks: formatted });
  } catch (err) {
    console.error("GET FEEDBACK BY TECHNICIAN ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};
