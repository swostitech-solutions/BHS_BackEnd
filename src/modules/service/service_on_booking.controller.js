const db = require("../../../models");
const ServiceOnBooking = db.ServiceOnBooking;
const Service = db.Service;
const SubService = db.SubService;
const User = db.User;
const Technician = db.Technician;

// Generate order_id
const generateOrderId = async () => {
  const last = await ServiceOnBooking.findOne({ order: [["id", "DESC"]] });
  let nextNum = 100001;
  if (last && last.order_id) {
    const lastNum = parseInt(last.order_id.replace("BD", ""));
    nextNum = lastNum + 1;
  }
  return `BD${nextNum}`;
};



const attachBookingImage = (req, booking) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return {
    ...booking,
    image: booking.image ? baseUrl + booking.image : null,
  };
};




// CREATE booking
exports.createBooking = async (req, res) => {
  try {
    const {
      user_id, //  New: accept user_id
      service_code,
      subservice_code,
      address,
      date,
      time_slot,
      gst,
      emergency_price,
      quantity,
      price,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // Auto generate order_id
    const lastBooking = await ServiceOnBooking.findOne({
      order: [["id", "DESC"]],
    });
    let order_id = "BD100001";
    if (lastBooking) {
      const lastNumber = parseInt(lastBooking.order_id.replace("BD", ""));
      order_id = `BD${lastNumber + 1}`;
    }

    const total_price =
      price * quantity + (emergency_price ? Number(emergency_price) : 0);

    const booking = await ServiceOnBooking.create({
      order_id,
      user_id, // ✅ save user_id
      service_code,
      subservice_code,
      address,
      date,
      time_slot,
      gst,
      emergency_price: emergency_price || 0,
      quantity,
      total_price,
      payment_method: "COD",
    });

    // Include Service, SubService, and User details
    const bookingWithDetails = await ServiceOnBooking.findByPk(booking.id, {
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email"], // ✅ only return these fields
        },
      ],
    });

    res.status(201).json({
      message: "Booking created",
      booking: bookingWithDetails,
    });
  } catch (err) {
    console.error("CREATE BOOKING ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET all bookings with service, subservice & user details
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await ServiceOnBooking.findAll({
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format bookings to merge technician user info
    const formattedBookings = bookings.map((b) => {
      const booking = b.toJSON();

      if (booking.technician && booking.technician.user) {
        const user = booking.technician.user;
        booking.technician = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          username: user.username,
          roleId: user.roleId,
          roleName: "Technician",
          technicianDetails: {
            skill: booking.technician.skill,
            experience: booking.technician.experience,
            status: booking.technician.status,
            aadharCardNo: booking.technician.aadharCardNo,
            panCardNo: booking.technician.panCardNo,
            bankName: booking.technician.bankName,
            ifscNo: booking.technician.ifscNo,
            branchName: booking.technician.branchName,
            timeDuration: booking.technician.timeDuration,
            emergencyAvailable: booking.technician.emergencyAvailable,
            techCategory: booking.technician.techCategory,
          },
        };
        booking.technician_id = user.id; // same as User.id
      }

      // return booking;
      return attachBookingImage(req, booking);

    });

    res.status(200).json({ bookings: formattedBookings });
  } catch (err) {
    console.error("GET ALL BOOKINGS ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};



// GET bookings by user_id
exports.getBookingsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const bookings = await ServiceOnBooking.findAll({
      where: { user_id },
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!bookings.length) {
      return res.status(404).json({
        message: "No bookings found for this user",
      });
    }

    // 🔥 SAME technician merge logic
    const formattedBookings = bookings.map((b) => {
      const booking = b.toJSON();

      if (booking.technician && booking.technician.user) {
        const user = booking.technician.user;

        booking.technician = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          username: user.username,
          roleId: user.roleId,
          roleName: "Technician",
          technicianDetails: {
            skill: booking.technician.skill,
            experience: booking.technician.experience,
            status: booking.technician.status,
            aadharCardNo: booking.technician.aadharCardNo,
            panCardNo: booking.technician.panCardNo,
            bankName: booking.technician.bankName,
            ifscNo: booking.technician.ifscNo,
            branchName: booking.technician.branchName,
            timeDuration: booking.technician.timeDuration,
            emergencyAvailable: booking.technician.emergencyAvailable,
            techCategory: booking.technician.techCategory,
          },
        };

        booking.technician_id = user.id;
      }

      // return booking;
      return attachBookingImage(req, booking);

    });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings: formattedBookings,
    });
  } catch (err) {
    console.error("GET BOOKINGS BY USER ID ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET bookings by technician (using technician USER ID)
exports.getBookingsByTechnicianId = async (req, res) => {
  try {
    const { technician_id } = req.params;

    if (!technician_id) {
      return res.status(400).json({ message: "technician_id is required" });
    }

    const bookings = await ServiceOnBooking.findAll({
      where: {
        technician_allocated: true,
      },
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          where: { userId: technician_id }, //  IMPORTANT
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format response (same as other APIs)
    const formattedBookings = bookings.map((b) => {
      const booking = b.toJSON();

      if (booking.technician && booking.technician.user) {
        const user = booking.technician.user;

        booking.technician = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          username: user.username,
          roleId: user.roleId,
          roleName: "Technician",
          technicianDetails: {
            skill: booking.technician.skill,
            experience: booking.technician.experience,
            status: booking.technician.status,
            aadharCardNo: booking.technician.aadharCardNo,
            panCardNo: booking.technician.panCardNo,
            bankName: booking.technician.bankName,
            ifscNo: booking.technician.ifscNo,
            branchName: booking.technician.branchName,
            timeDuration: booking.technician.timeDuration,
            emergencyAvailable: booking.technician.emergencyAvailable,
            techCategory: booking.technician.techCategory,
          },
        };

        booking.technician_id = user.id;
      }

      // return booking;
      return attachBookingImage(req, booking);

    });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings: formattedBookings,
    });
  } catch (err) {
    console.error("GET BOOKINGS BY TECHNICIAN ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};



// GET booking by order_id (SAME RESPONSE AS getAllBookings)
exports.getBookingByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;

    const bookingInstance = await ServiceOnBooking.findOne({
      where: { order_id },
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
    });

    if (!bookingInstance) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Convert to JSON
    const booking = bookingInstance.toJSON();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🔥 SAME MERGE LOGIC AS getAllBookings
    if (booking.technician && booking.technician.user) {
      const user = booking.technician.user;

      booking.technician = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        username: user.username,
        roleId: user.roleId,
        roleName: "Technician",
        technicianDetails: {
          skill: booking.technician.skill,
          experience: booking.technician.experience,
          status: booking.technician.status,
          aadharCardNo: booking.technician.aadharCardNo,
          panCardNo: booking.technician.panCardNo,
          bankName: booking.technician.bankName,
          ifscNo: booking.technician.ifscNo,
          branchName: booking.technician.branchName,
          timeDuration: booking.technician.timeDuration,
          emergencyAvailable: booking.technician.emergencyAvailable,
          techCategory: booking.technician.techCategory,
        },
      };

      booking.technician_id = user.id;
    }

    // ✅ FIX: Attach FULL image URL
    booking.image = booking.image ? baseUrl + booking.image : null;

    // ✅ (Optional but recommended) attach service & subservice images
    if (booking.service?.image) {
      booking.service.image =
        baseUrl + "/uploads/services/" + booking.service.image;
    }

    if (booking.subservice?.image) {
      booking.subservice.image = baseUrl + booking.subservice.image;
    }

    res.status(200).json({ booking });
  } catch (err) {
    console.error("GET BOOKING BY ORDER_ID ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET bookings by service_code
exports.getBookingsByServiceCode = async (req, res) => {
  try {
    const { service_code } = req.params;

    if (!service_code) {
      return res.status(400).json({ message: "service_code is required" });
    }

    const bookings = await ServiceOnBooking.findAll({
      where: { service_code },
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!bookings.length) {
      return res.status(404).json({
        message: "No bookings found for this service_code",
      });
    }

    // 🔥 SAME FORMATTER LOGIC
    const formattedBookings = bookings.map((b) => {
      const booking = b.toJSON();

      if (booking.technician && booking.technician.user) {
        const user = booking.technician.user;

        booking.technician = {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          username: user.username,
          roleId: user.roleId,
          roleName: "Technician",
          technicianDetails: {
            skill: booking.technician.skill,
            experience: booking.technician.experience,
            status: booking.technician.status,
            aadharCardNo: booking.technician.aadharCardNo,
            panCardNo: booking.technician.panCardNo,
            bankName: booking.technician.bankName,
            ifscNo: booking.technician.ifscNo,
            branchName: booking.technician.branchName,
            timeDuration: booking.technician.timeDuration,
            emergencyAvailable: booking.technician.emergencyAvailable,
            techCategory: booking.technician.techCategory,
          },
        };

        booking.technician_id = user.id;
      }

      return attachBookingImage(req, booking);
    });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings: formattedBookings,
    });
  } catch (err) {
    console.error("GET BOOKINGS BY SERVICE CODE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




//accept Booking 
exports.acceptBooking = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { technician_id, opinion = 1 } = req.body; // default = 1 (Accept)

    if (!technician_id) {
      return res.status(400).json({ message: "technician_id is required" });
    }

    // Check booking exists
    const booking = await ServiceOnBooking.findOne({ where: { order_id } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Opinion handling
    if (![1, 2].includes(opinion)) {
      return res
        .status(400)
        .json({ message: "Invalid opinion (1=Accept, 2=Reject)" });
    }

    if (opinion === 2) {
      // REJECT
      booking.technician_allocated = false;
      booking.technician_id = null;
      booking.work_status = 0; // optional: 0 = Rejected    1 = accept, 2 = reject
      await booking.save();

      return res.status(200).json({
        message: "Booking rejected by technician",
        booking,
      });
    }

    // ACCEPT flow
    if (booking.technician_allocated) {
      return res
        .status(400)
        .json({ message: "Booking already accepted by a technician" });
    }

    // Find Technician by userId
    let technician = await Technician.findOne({
      where: { userId: technician_id },
      include: [
        {
          model: User,
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
      // Auto-create technician row if it doesn't exist
      technician = await Technician.create({
        userId: technician_id,
        status: "ACCEPT",
      });

      technician.user = await User.findByPk(technician_id, {
        attributes: [
          "id",
          "name",
          "email",
          "mobile",
          "address",
          "username",
          "roleId",
        ],
      });
    }

    // Update booking
    booking.technician_allocated = true;
    booking.technician_id = technician.id; // store Technician PK (FK)
    booking.work_status = 1; // 1 = Pending
    booking.work_status_code = null;
    await booking.save();

    // Fetch updated booking with associations
    const updatedBooking = await ServiceOnBooking.findByPk(booking.id, {
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "username", "email", "name", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
          attributes: [
            "skill",
            "experience",
            "status",
            "aadharCardNo",
            "panCardNo",
            "bankName",
            "ifscNo",
            "branchName",
            "timeDuration",
            "emergencyAvailable",
            "techCategory",
          ],
        },
      ],
    });

    // Merge user info into technician object
    const bookingData = updatedBooking.toJSON();
    if (bookingData.technician && bookingData.technician.user) {
      const user = bookingData.technician.user;
      bookingData.technician = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        username: user.username,
        roleId: user.roleId,
        roleName: "Technician",
        technicianDetails: {
          skill: bookingData.technician.skill,
          experience: bookingData.technician.experience,
          status: bookingData.technician.status,
          aadharCardNo: bookingData.technician.aadharCardNo,
          panCardNo: bookingData.technician.panCardNo,
          bankName: bookingData.technician.bankName,
          ifscNo: bookingData.technician.ifscNo,
          branchName: bookingData.technician.branchName,
          timeDuration: bookingData.technician.timeDuration,
          emergencyAvailable: bookingData.technician.emergencyAvailable,
          techCategory: bookingData.technician.techCategory,
        },
      };
      bookingData.technician_id = user.id;
    }

    res.status(200).json({
      message: "Booking accepted by technician",
      booking: bookingData,
    });
  } catch (err) {
    console.error("ACCEPT BOOKING ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




// update work status
exports.updateWorkStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { technician_id, work_status, notes } = req.body;

    if (!technician_id || !work_status) {
      return res.status(400).json({
        message: "technician_id and work_status are required",
      });
    }

    if (![1, 3].includes(Number(work_status))) {
      return res.status(400).json({
        message: "Invalid work_status (1 = Pending, 3 = Completed)",
      });
    }

    const booking = await ServiceOnBooking.findOne({ where: { order_id } });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const technician = await Technician.findOne({
      where: { userId: technician_id },
    });
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // 🔹 Generate work status code only once
    let workStatusCode = booking.work_status_code;
    if (Number(work_status) === 3 && !workStatusCode) {
      const count = await ServiceOnBooking.count({
        where: { work_status: 3 },
      });
      workStatusCode = `BDW${booking.order_id.replace("BD", "")}-${String(
        count + 1
      ).padStart(2, "0")}`;
    }

    // ✅ CORRECT IMAGE HANDLING (USE image FIELD)
    // const image = req.file
    //   ? `/uploads/booking-services/${req.file.filename}`
    //   : booking.image;

    const image = req.file?.path; // Cloudinary URL

    await booking.update({
      work_status,
      work_status_code: workStatusCode,
      work_notes: notes || booking.work_notes,
      image, // ✅ FIXED
    });

    const updatedBooking = await ServiceOnBooking.findByPk(booking.id, {
      include: [
        { model: Service, as: "service" },
        { model: SubService, as: "subservice" },
        {
          model: User,
          attributes: ["id", "name", "email", "mobile", "address"],
        },
        {
          model: Technician,
          as: "technician",
          include: [
            {
              model: User,
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
        },
      ],
    });

    const data = updatedBooking.toJSON();
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Normalize technician
    if (data.technician?.user) {
      const u = data.technician.user;
      data.technician = {
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        address: u.address,
        username: u.username,
        roleId: u.roleId,
        roleName: "Technician",
      };
      data.technician_id = u.id;
    }

    // ✅ FULL IMAGE URL
    data.image = data.image ? baseUrl + data.image : null;

    // Attach service/subservice images
    if (data.service?.image) {
      data.service.image = baseUrl + "/uploads/services/" + data.service.image;
    }
    if (data.subservice?.image) {
      data.subservice.image = baseUrl + data.subservice.image;
    }

    data.work_status_label =
      Number(work_status) === 1 ? "Pending" : "Completed";

    return res.status(200).json({
      message: "Work status updated successfully",
      booking: data,
    });
  } catch (err) {
    console.error("UPDATE WORK STATUS ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};




