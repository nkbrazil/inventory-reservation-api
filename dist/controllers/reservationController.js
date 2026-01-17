"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireReservations = exports.getAllReservations = exports.getReservationById = exports.cancelReservation = exports.confirmReservation = exports.createReservation = void 0;
const reservationService_1 = require("../services/reservationService");
const createReservation = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const reservation = await reservationService.createReservation(req.body);
        res.status(201).json({ success: true, data: reservation });
    }
    catch (error) {
        if (error.statusCode === 409) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};
exports.createReservation = createReservation;
const confirmReservation = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const reservation = await reservationService.confirmReservation(req.params.id);
        res.status(200).json({ success: true, data: reservation });
    }
    catch (error) {
        if (error.statusCode === 400 || error.statusCode === 409) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};
exports.confirmReservation = confirmReservation;
const cancelReservation = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const reservation = await reservationService.cancelReservation(req.params.id);
        res.status(200).json({ success: true, data: reservation });
    }
    catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};
exports.cancelReservation = cancelReservation;
const getReservationById = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const reservation = await reservationService.getReservationById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Reservation not found",
            });
        }
        res.status(200).json({ success: true, data: reservation });
    }
    catch (error) {
        next(error);
    }
};
exports.getReservationById = getReservationById;
const getAllReservations = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const reservations = await reservationService.getAllReservations();
        res.status(200).json({ success: true, data: reservations });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReservations = getAllReservations;
const expireReservations = async (req, res, next) => {
    const reservationService = new reservationService_1.ReservationService();
    try {
        const result = await reservationService.expireReservations();
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.expireReservations = expireReservations;
