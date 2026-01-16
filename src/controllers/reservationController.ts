import { Request, Response, NextFunction } from "express";
import { ReservationService } from "../services/reservationService";
import { ReservationParams } from "../schemas/reservationSchema";

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json({ success: true, data: reservation });
  } catch (error: any) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const confirmReservation = async (
  req: Request<ReservationParams>,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const reservation = await reservationService.confirmReservation(
      req.params.id
    );
    res.status(200).json({ success: true, data: reservation });
  } catch (error: any) {
    if (error.statusCode === 400 || error.statusCode === 409) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const cancelReservation = async (
  req: Request<ReservationParams>,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const reservation = await reservationService.cancelReservation(
      req.params.id
    );
    res.status(200).json({ success: true, data: reservation });
  } catch (error: any) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getReservationById = async (
  req: Request<ReservationParams>,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const reservation = await reservationService.getReservationById(
      req.params.id
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const reservations = await reservationService.getAllReservations();
    res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const expireReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const result = await reservationService.expireReservations();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
