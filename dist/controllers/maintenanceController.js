"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireReservations = void 0;
const reservationService_1 = require("../services/reservationService");
const expireReservations = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const result = await reservationService.expireReservations();
        res.status(200).json({
            success: true,
            data: {
                expired_count: result.expired_count,
                message: `${result.expired_count} reservation(s) expired`,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.expireReservations = expireReservations;
