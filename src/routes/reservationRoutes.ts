import { Router } from "express";
import * as reservationController from "../controllers/reservationController";
import {
  createReservationSchema,
  reservationParamsSchema,
} from "../schemas/reservationSchema";
import { validateBody, validateParams } from "../middleware/validateReq";

const router = Router();

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a temporary reservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - customer_id
 *               - quantity
 *             properties:
 *               item_id:
 *                 type: string
 *                 format: uuid
 *               customer_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     item_id:
 *                       type: string
 *                     customer_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     status:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *       409:
 *         description: Insufficient available quantity
 */
router.post(
  "/",
  validateBody(createReservationSchema),
  reservationController.createReservation
);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservation details
 *       404:
 *         description: Reservation not found
 */
router.get(
  "/:id",
  validateParams(reservationParamsSchema),
  reservationController.getReservationById
);

/**
 * @swagger
 * /reservations/{id}/confirm:
 *   post:
 *     summary: Confirm a reservation (permanently deducts quantity)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservation confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Cannot confirm (expired or invalid status)
 */
router.post(
  "/:id/confirm",
  validateParams(reservationParamsSchema),
  reservationController.confirmReservation
);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   post:
 *     summary: Cancel a reservation (releases quantity)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Cannot cancel (already confirmed)
 */
router.post(
  "/:id/cancel",
  validateParams(reservationParamsSchema),
  reservationController.cancelReservation
);

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservation
 *
 *     responses:
 *       200:
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Cannot find reservation
 */
router.get("/", reservationController.getAllReservations);

export default router;
