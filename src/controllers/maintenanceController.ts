import { Request, Response, NextFunction } from "express";
import { ReservationService } from "../services/reservationService";

export const expireReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reservationService = new ReservationService();
  try {
    const result = await reservationService.expireReservations();
    res.status(200).json({
      success: true,
      data: {
        expired_count: result.expired_count,
        message: `${result.expired_count} reservation(s) expired`,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
