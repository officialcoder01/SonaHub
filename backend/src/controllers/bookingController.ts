import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  rejectBooking,
} from "../services/bookingService.js";
import type { Request, Response } from "express";

const sendError = (
  res: Response,
  err: unknown,
  fallbackMessage: string
) => {
  const message = err instanceof Error ?
    err.message : fallbackMessage;

  const status =
    typeof err === "object" &&
    err !== null && "status" in err &&
    typeof err.status === "number"
      ? err.status
      : 500;

  return res.status(status).json({ message });
};

export const createBookingRequest = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    const booking = await createBooking({
      userId: req.user.id,
      role: req.user.role,
      serviceId: req.body.serviceId,
      message: req.body.message,
    });

    return res.status(201).json(booking);
  } catch (err: unknown) {
    sendError(res, err, "Unable to create booking");
  }
};

export const listMyBookings = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    const bookings = await getCustomerBookings({
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({ bookings });
  } catch (err) {
    sendError(res, err, "Unable to fetch bookings");
  }
};

export const listVendorBookings = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await getVendorBookings({
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      bookings: result.bookings,
      statusCounts: result.statusCounts,
    });
  } catch (err) {
    sendError(res, err, "Unable to fetch vendor bookings");
  }
};

export const acceptBookingRequest = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookingId = req.params.id;
  if (typeof bookingId !== "string") {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    const booking = await acceptBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId,
    });

    return res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to accept booking");
  }
};

export const rejectBookingRequest = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookingId = req.params.id;
  if (typeof bookingId !== "string") {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    const booking = await rejectBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId,
    });

    return res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to reject booking");
  }
};

export const cancelBookingRequest = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookingId = req.params.id;
  if (typeof bookingId !== "string") {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    const booking = await cancelBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId,
    });

    return res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to cancel booking");
  }
};

export const completeBookingRequest = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bookingId = req.params.id;
  if (typeof bookingId !== "string") {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    const booking = await completeBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId,
    });

    return res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to complete booking");
  }
};
