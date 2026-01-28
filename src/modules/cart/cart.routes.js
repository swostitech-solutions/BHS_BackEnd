
    const express = require("express");
    const router = express.Router();
    const cartController = require("./cart.controller");

    /**
     * @swagger
     * tags:
     *   name: Cart
     *   description: Cart management APIs
     */

    /**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add SubService to cart using codes
 *     tags: [Cart]
 *     description: |
 *       Maps service_code & subservice_code internally to IDs.
 *       Returns full service & subservice details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - service_code
 *               - subservice_code
 *             properties:
 *               user_id:
 *                 type: integer
 *               service_code:
 *                 type: string
 *                 example: AC10001
 *               subservice_code:
 *                 type: string
 *                 example: AC10001-02
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Cart item created with full details
 */
router.post("/", cartController.addToCart);




/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get all cart items (no filter)
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: All cart items fetched successfully
 */
router.get("/", cartController.getAllCarts);







    /**
     * @swagger
     * /cart/{userId}:
     *   get:
     *     summary: View cart items for a user
     *     tags: [Cart]
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Cart items fetched with service + subservice details
     */
    router.get("/:userId", cartController.getCartByUser);

    /**
     * @swagger
     * /cart/item/{cartId}:
     *   delete:
     *     summary: Remove item from cart
     *     tags: [Cart]
     *     parameters:
     *       - in: path
     *         name: cartId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Item removed
     */
    router.delete("/item/:cartId", cartController.removeFromCart);

    module.exports = router;
