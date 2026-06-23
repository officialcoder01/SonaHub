import prisma from "../config/prisma.js";

const assertCustomer = (role, message = "Only customers can access bookings") => {
  if (role !== "CUSTOMER") {
    const error = new Error(message);
    error.status = 403;
    throw error;
  }
};

const assertVendor = (role) => {
  if (role !== "VENDOR") {
    const error = new Error("Only vendors can manage bookings");
    error.status = 403;
    throw error;
  }
};

const notFound = () => {
  const error = new Error("Booking not found");
  error.status = 404;
  throw error;
};

const getVendorProfile = async (userId, role) => {
  assertVendor(role);

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    const error = new Error("Vendor profile is required to manage bookings");
    error.status = 403;
    throw error;
  }

  return vendorProfile;
};

const getBookingById = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    notFound();
  }

  return booking;
};

const assertVendorOwnsBooking = (booking, vendorId) => {
  if (booking.vendorId !== vendorId) {
    const error = new Error("You do not have permission to manage this booking");
    error.status = 403;
    throw error;
  }
};

const assertCustomerOwnsBooking = (booking, customerId) => {
  if (booking.customerId !== customerId) {
    const error = new Error("You do not have permission to cancel this booking");
    error.status = 403;
    throw error;
  }
};

const assertStatus = (booking, allowedStatuses, message) => {
  if (!allowedStatuses.includes(booking.status)) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
};

export const createBooking = async ({ userId, role, serviceId, message }) => {
  // Customers are the only actors allowed to open booking requests.
  assertCustomer(role, "Only customers can create bookings");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { vendor: true },
  });

  if (!service) {
    const error = new Error("Service not found");
    error.status = 404;
    throw error;
  }

  // A vendor must not be able to create demand against their own listing.
  if (service.vendor?.userId === userId) {
    const error = new Error("Vendors cannot book their own services");
    error.status = 403;
    throw error;
  }

  return prisma.booking.create({
    data: {
      customerId: userId,
      vendorId: service.vendorId,
      serviceId,
      message,
    },
    select: {
      id: true,
      status: true,
    },
  });
};

export const getCustomerBookings = async ({ userId, role }) => {
  // Customers can only view bookings they created.
  assertCustomer(role);

  return prisma.booking.findMany({
    where: { customerId: userId },
    include: {
      service: {
        include: {
          images: true,
        },
      },
      vendor: true,
      // Include the related review so the frontend knows whether a completed
      // booking has already been reviewed without making a separate API call.
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getVendorBookings = async ({ userId, role }) => {
  // Vendor profile ownership maps the logged-in user to assigned bookings.
  const vendorProfile = await getVendorProfile(userId, role);

  return prisma.booking.findMany({
    where: { vendorId: vendorProfile.id },
    include: {
      customer: true,
      service: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const acceptBooking = async ({ userId, role, bookingId }) => {
  // Only the assigned vendor can move a new request from PENDING to ACCEPTED.
  const vendorProfile = await getVendorProfile(userId, role);
  const booking = await getBookingById(bookingId);

  assertVendorOwnsBooking(booking, vendorProfile.id);
  assertStatus(booking, ["PENDING"], "Only pending bookings can be accepted");

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });
};

export const rejectBooking = async ({ userId, role, bookingId }) => {
  // Rejection is terminal and is only valid before the vendor accepts work.
  const vendorProfile = await getVendorProfile(userId, role);
  const booking = await getBookingById(bookingId);

  assertVendorOwnsBooking(booking, vendorProfile.id);
  assertStatus(booking, ["PENDING"], "Only pending bookings can be rejected");

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REJECTED" },
  });
};

export const cancelBooking = async ({ userId, role, bookingId }) => {
  // Customers may cancel only active work: before acceptance or after acceptance.
  assertCustomer(role);
  const booking = await getBookingById(bookingId);

  assertCustomerOwnsBooking(booking, userId);
  assertStatus(
    booking,
    ["PENDING", "ACCEPTED"],
    "Only pending or accepted bookings can be cancelled"
  );

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });
};

export const completeBooking = async ({ userId, role, bookingId }) => {
  // Completion is vendor-only and requires the job to have been accepted first.
  const vendorProfile = await getVendorProfile(userId, role);
  const booking = await getBookingById(bookingId);

  assertVendorOwnsBooking(booking, vendorProfile.id);
  assertStatus(booking, ["ACCEPTED"], "Only accepted bookings can be completed");

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
};
