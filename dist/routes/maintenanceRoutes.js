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
const maintenanceController = __importStar(require("../controllers/maintenanceController"));
const router = (0, express_1.Router)();
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
exports.default = router;
