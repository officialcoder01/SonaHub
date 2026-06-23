import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  rejectBooking,
} from "../services/bookingService.js";

const sendError = (res, err, fallbackMessage) => {
  res.status(err.status || 500).json({
    message: err.message || fallbackMessage,
  });
};

export const createBookingRequest = async (req, res) => {
  try {
    const booking = await createBooking({
      userId: req.user.id,
      role: req.user.role,
      serviceId: req.body.serviceId,
      message: req.body.message,
    });

    res.status(201).json(booking);
  } catch (err) {
    sendError(res, err, "Unable to create booking");
  }
};

export const listMyBookings = async (req, res) => {
  try {
    const bookings = await getCustomerBookings({
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({ bookings });
  } catch (err) {
    sendError(res, err, "Unable to fetch bookings");
  }
};

export const listVendorBookings = async (req, res) => {
  try {
    const bookings = await getVendorBookings({
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({ bookings });
  } catch (err) {
    sendError(res, err, "Unable to fetch vendor bookings");
  }
};

export const acceptBookingRequest = async (req, res) => {
  try {
    const booking = await acceptBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId: req.params.id,
    });

    res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to accept booking");
  }
};

export const rejectBookingRequest = async (req, res) => {
  try {
    const booking = await rejectBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId: req.params.id,
    });

    res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to reject booking");
  }
};

export const cancelBookingRequest = async (req, res) => {
  try {
    const booking = await cancelBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId: req.params.id,
    });

    res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to cancel booking");
  }
};

export const completeBookingRequest = async (req, res) => {
  try {
    const booking = await completeBooking({
      userId: req.user.id,
      role: req.user.role,
      bookingId: req.params.id,
    });

    res.status(200).json({ booking });
  } catch (err) {
    sendError(res, err, "Unable to complete booking");
  }
};
