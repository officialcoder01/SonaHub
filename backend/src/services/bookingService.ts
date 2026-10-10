import prisma from "../config/prisma.js";
import { assertVendor } from "../utils/roleCheckUtils.js";
import type { VendorProfile, Booking } from "@prisma/client"

interface BookingStatusCounts {
  bookings: Booking[];
  statusCounts: {
    pending: number;
    accepted: number;
    completed: number;
    rejected: number;
    cancelled: number;
  }
}

interface User {
  userId: string;
  role: string;
}

interface UserWithBookingId extends User {
  bookingId: string;
}

interface NewBookingRequest {
  userId: string;
  role: string;
  serviceId: string;
  message?: string;
}

interface NewBookingResponse {
  id: string;
  status: string;
}

interface BookingError extends Error {
  status?: number;
}

const getVendorProfile = async (
  userId: string,
  role: string
): Promise<VendorProfile> => {
  assertVendor(role, "Only vendors can manage their bookings");

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    const error = new Error(
      "Vendor profile is required to manage bookings"
    ) as BookingError;
    error.status = 403;
    throw error;
  }

  return vendorProfile;
};

const getBookingById = async (bookingId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    const error = new Error(
      "Booking not found"
    ) as BookingError;
    error.status = 403;
    throw error;
  }

  return booking;
};

const assertVendorOwnsBooking = (
  booking: { vendorId: string },
  vendorId: string
) => {
  if (booking.vendorId !== vendorId) {
    const error = new Error("You do not have permission to manage this booking") as BookingError;
    error.status = 403;
    throw error;
  }
};

const assertCustomerOwnsBooking = (
  booking: { customerId: string },
  customerId: string
) => {
  if (booking.customerId !== customerId) {
    const error = new Error("You do not have permission to cancel this booking") as BookingError;
    error.status = 403;
    throw error;
  }
};

const assertStatus = (
  booking: { status: string },
  allowedStatuses: string[],
  message: string
) => {
  if (!allowedStatuses.includes(booking.status)) {
    const error = new Error(message) as BookingError;
    error.status = 400;
    throw error;
  }
};

export const createBooking = async ({
  userId,
  role,
  serviceId,
  message
}: NewBookingRequest): Promise<NewBookingResponse> => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { vendor: true },
  });

  if (!service) {
    const error = new Error("Service not found") as BookingError;
    error.status = 404;
    throw error;
  }

  // A vendor must not be able to create demand against their own listing.
  if (service.vendor?.userId === userId) {
    const error = new Error("Vendors cannot book their own services") as BookingError;
    error.status = 403;
    throw error;
  } else if (role === "ADMIN") {
    const error = new Error("Admins cannot create bookings") as BookingError;
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

export const getCustomerBookings = async ({ userId }: User) => {
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

export const getVendorBookings = async ({
  userId,
  role
}: User): Promise<BookingStatusCounts> => {
  // Vendor profile ownership maps the logged-in user to assigned bookings.
  const vendorProfile = await getVendorProfile(userId, role);

  const [bookings, statusCounts] = await Promise.all([
    prisma.booking.findMany({
      where: { vendorId: vendorProfile.id },
      include: {
        service: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { vendorId: vendorProfile.id },
      _count: { status: true },
    }),
  ]);

  // Convert the array of status counts into an object for easier consumption by the frontend.
  const counts = statusCounts.reduce((
    acc: any,
    curr: any
  ) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {});

  return {
    bookings,
    statusCounts: {
      pending: counts.PENDING || 0,
      accepted: counts.ACCEPTED || 0,
      completed: counts.COMPLETED || 0,
      rejected: counts.REJECTED || 0,
      cancelled: counts.CANCELLED || 0,
    },
  };
};

export const acceptBooking = async ({
  userId,
  role,
  bookingId

}: UserWithBookingId) => {
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

export const rejectBooking = async ({
  userId,
  role,
  bookingId
}: UserWithBookingId) => {
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

export const cancelBooking = async ({
  userId,
  bookingId
}: UserWithBookingId) => {
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

export const completeBooking = async ({
  userId,
  role,
  bookingId
}: UserWithBookingId) => {
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
