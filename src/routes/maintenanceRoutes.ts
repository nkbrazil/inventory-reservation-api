import { Router } from "express";
import * as maintenanceController from "../controllers/maintenanceController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance operations for the inventory system
 */

/**
 * @swagger
 * /maintenance/expire-reservations:
 *   post:
 *     summary: Expire old pending reservations
 *     tags: [Maintenance]
 *     description: Marks old pending reservations as expired and releases their quantity back to availability
 *     responses:
 *       200:
 *         description: Reservations expired successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     expired_count:
 *                       type: integer
 *                       example: 5
 *                     message:
 *                       type: string
 *                       example: "5 reservation(s) expired"
 *       500:
 *         description: Internal server error
 */
router.post("/expire-reservations", maintenanceController.expireReservations);

export default router;
