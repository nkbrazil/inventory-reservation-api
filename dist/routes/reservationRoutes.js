"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController = __importStar(require("../controllers/reservationController"));
const reservationSchema_1 = require("../schemas/reservationSchema");
const validateReq_1 = require("../middleware/validateReq");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Endpoints for managing reservations
 */
/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Create a temporary reservation
 *     tags: [Reservations]
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
router.post("/", (0, validateReq_1.validateBody)(reservationSchema_1.createReservationSchema), reservationController.createReservation);
/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
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
router.get("/:id", (0, validateReq_1.validateParams)(reservationSchema_1.reservationParamsSchema), reservationController.getReservationById);
/**
 * @swagger
 * /reservations/{id}/confirm:
 *   post:
 *     summary: Confirm a reservation (permanently deducts quantity)
 *     tags: [Reservations]
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
router.post("/:id/confirm", (0, validateReq_1.validateParams)(reservationSchema_1.reservationParamsSchema), reservationController.confirmReservation);
/**
 * @swagger
 * /reservations/{id}/cancel:
 *   post:
 *     summary: Cancel a reservation (releases quantity)
 *     tags: [Reservations]
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
router.post("/:id/cancel", (0, validateReq_1.validateParams)(reservationSchema_1.reservationParamsSchema), reservationController.cancelReservation);
/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservation
 *     tags: [Reservations]
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
exports.default = router;
