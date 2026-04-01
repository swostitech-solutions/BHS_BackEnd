
const db = require("../../../models");
const Cart = db.Cart;
const SubService = db.SubService;
const Service = db.Service;

/**
 * Build full image URL safely
 */
const formatImage = (req, img) => {
  if (!img) return null;
  return `${req.protocol}://${req.get("host")}${img}`;
};

/**
 * Format cart response
 */
const formatCartItem = (req, c) => ({
  id: c.id,
  user_id: c.user_id,
  quantity: c.quantity,
  price: c.price,

  User: c.User && {
    id: c.User.id,
    name: c.User.name,
    email: c.User.email,
  },

  Service: c.Service && {
    id: c.Service.id,
    name: c.Service.name,
    service_code: c.Service.service_code,
    image: c.Service.image,
    imageUrl: formatImage(req, c.Service.image),
  },

  SubService: c.SubService && {
    id: c.SubService.id,
    name: c.SubService.name,
    subservice_code: c.SubService.subservice_code,
    description: c.SubService.description,
    price: c.SubService.price,
    image: c.SubService.image,
    imageUrl: formatImage(req, c.SubService.image),
  },
});


/**
 * Add item to cart
 */
exports.addToCart = async (req, res) => {
  try {
    let { user_id, service_code, subservice_code, quantity = 1 } = req.body;

    if (!user_id || !service_code || !subservice_code) {
      return res.status(400).json({
        message: "user_id, service_code and subservice_code are required",
      });
    }

    const service = await Service.findOne({ where: { service_code } });
    if (!service) {
      return res.status(404).json({ message: "Invalid service_code" });
    }

    const subservice = await SubService.findOne({
      where: { subservice_code },
    });
    if (!subservice) {
      return res.status(404).json({ message: "Invalid subservice_code" });
    }

    if (subservice.service_id !== service.id) {
      return res.status(400).json({
        message: "SubService does not belong to given Service",
      });
    }

    const cart = await Cart.create({
      user_id,
      service_id: service.id,
      subservice_id: subservice.id,
      quantity,
      price: subservice.price,
    });

    const cartItem = await Cart.findByPk(cart.id, {
      include: [{ model: Service }, { model: SubService }, { model: db.User }],
    });

    return res.status(201).json({
      message: "Item added to cart successfully",
      data: formatCartItem(req, cartItem),
    });
  } catch (err) {
    console.error("ADD TO CART ERROR →", err);
    return res.status(500).json({ message: "Server error" });
  }
};


//////////////// using cookies-parser for guest_id /////////
// exports.addToCart = async (req, res) => {
//   try {
//     let { user_id, service_code, subservice_code, quantity = 1 } = req.body;

//     let guest_id = req.cookies?.guest_id;

//     // ✅ Generate guest_id if not present
//     if (!user_id && !guest_id) {
//       guest_id = "guest_" + Math.random().toString(36).substring(2, 15);
//       res.cookie("guest_id", guest_id, {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
//       });
//     }

//     if (!service_code || !subservice_code) {
//       return res.status(400).json({
//         message: "service_code and subservice_code are required",
//       });
//     }

//     const service = await Service.findOne({ where: { service_code } });
//     if (!service) {
//       return res.status(404).json({ message: "Invalid service_code" });
//     }

//     const subservice = await SubService.findOne({
//       where: { subservice_code },
//     });
//     if (!subservice) {
//       return res.status(404).json({ message: "Invalid subservice_code" });
//     }

//     if (subservice.service_id !== service.id) {
//       return res.status(400).json({
//         message: "SubService does not belong to given Service",
//       });
//     }

//     /**
//      * ✅ STEP 1: If user logged in → merge guest cart
//      */
//     if (user_id && guest_id) {
//       const guestItems = await Cart.findAll({ where: { guest_id } });

//       for (let item of guestItems) {
//         const existing = await Cart.findOne({
//           where: {
//             user_id,
//             service_id: item.service_id,
//             subservice_id: item.subservice_id,
//           },
//         });

//         if (existing) {
//           existing.quantity += item.quantity;
//           await existing.save();
//           await item.destroy();
//         } else {
//           item.user_id = user_id;
//           item.guest_id = null;
//           await item.save();
//         }
//       }
//     }

//     /**
//      * ✅ STEP 2: Find existing item
//      */
//     const whereCondition = user_id
//       ? {
//           user_id,
//           service_id: service.id,
//           subservice_id: subservice.id,
//         }
//       : {
//           guest_id,
//           service_id: service.id,
//           subservice_id: subservice.id,
//         };

//     let cart = await Cart.findOne({ where: whereCondition });

//     if (cart) {
//       cart.quantity += quantity;
//       await cart.save();
//     } else {
//       cart = await Cart.create({
//         user_id: user_id || null,
//         guest_id: user_id ? null : guest_id,
//         service_id: service.id,
//         subservice_id: subservice.id,
//         quantity,
//         price: subservice.price,
//       });
//     }

//     const cartItem = await Cart.findByPk(cart.id, {
//       include: [{ model: Service }, { model: SubService }, { model: db.User }],
//     });

//     return res.status(201).json({
//       message: "Item added to cart successfully",
//       guest_id: guest_id || null, // ✅ send for frontend awareness
//       data: formatCartItem(req, cartItem),
//     });
//   } catch (err) {
//     console.error("ADD TO CART ERROR →", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


/**
 * Get ALL cart items (no user filter)
 */
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      include: [{ model: Service }, { model: SubService }, { model: db.User }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      count: carts.length,
      items: carts.map((c) => formatCartItem(req, c)),
    });
  } catch (error) {
    console.error("GET ALL CARTS ERROR →", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * View cart by user
 */
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{ model: Service }, { model: SubService }, { model: db.User }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      count: cartItems.length,
      items: cartItems.map((c) => formatCartItem(req, c)),
    });
  } catch (error) {
    console.error("GET CART ERROR →", error);
    res.status(500).json({ message: "Server error" });
  }
};



/////////////// for cookies-parser using guest_id getting code //////////////
// exports.getCartByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const guest_id = req.cookies?.guest_id;

//     const whereCondition = userId ? { user_id: userId } : { guest_id };

//     const cartItems = await Cart.findAll({
//       where: whereCondition,
//       include: [{ model: Service }, { model: SubService }, { model: db.User }],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({
//       count: cartItems.length,
//       items: cartItems.map((c) => formatCartItem(req, c)),
//     });
//   } catch (error) {
//     console.error("GET CART ERROR →", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

/**
 * Remove item from cart
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const deleted = await Cart.destroy({
      where: { id: cartId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
