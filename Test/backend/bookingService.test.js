const mockPrisma = {
  service: {
    findUnique: jest.fn(),
  },
  vendorProfile: {
    findUnique: jest.fn(),
  },
  booking: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

const {
  acceptBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  rejectBooking,
} = require("../../backend/src/services/bookingService.js");

describe("bookingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    test("creates a pending booking for a customer", async () => {
      const service = {
        id: "service-1",
        vendorId: "vendor-1",
        vendor: { userId: "vendor-user-1" },
      };
      const booking = {
        id: "booking-1",
        customerId: "customer-1",
        serviceId: "service-1",
        vendorId: "vendor-1",
        status: "PENDING",
        message: "Need this next week",
      };

      mockPrisma.service.findUnique.mockResolvedValue(service);
      mockPrisma.booking.create.mockResolvedValue(booking);

      const result = await createBooking({
        userId: "customer-1",
        role: "CUSTOMER",
        serviceId: "service-1",
        message: "Need this next week",
      });

      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: "service-1" },
        include: { vendor: true },
      });
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: {
          customerId: "customer-1",
          vendorId: "vendor-1",
          serviceId: "service-1",
          message: "Need this next week",
        },
        select: {
          id: true,
          status: true,
        },
      });
      expect(result).toEqual(booking);
    });

    test("fails when service does not exist", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(
        createBooking({
          userId: "customer-1",
          role: "CUSTOMER",
          serviceId: "missing-service",
        })
      ).rejects.toThrow("Service not found");

      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    test("fails when a vendor tries to create a booking", async () => {
      await expect(
        createBooking({
          userId: "vendor-user-1",
          role: "VENDOR",
          serviceId: "service-1",
        })
      ).rejects.toThrow("Only customers can create bookings");

      expect(mockPrisma.service.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });
  });

  describe("acceptBooking", () => {
    test("accepts a pending booking and sets acceptedAt", async () => {
      const booking = {
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      };
      const accepted = {
        ...booking,
        status: "ACCEPTED",
        acceptedAt: new Date("2026-05-30T10:00:00.000Z"),
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue(accepted);

      const result = await acceptBooking({
        userId: "vendor-user-1",
        role: "VENDOR",
        bookingId: "booking-1",
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: {
          status: "ACCEPTED",
          acceptedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(accepted);
    });

    test("fails when booking is not owned by vendor", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-2",
        status: "PENDING",
      });

      await expect(
        acceptBooking({
          userId: "vendor-user-1",
          role: "VENDOR",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("You do not have permission to manage this booking");

      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    test("fails for invalid status transitions", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "CANCELLED",
      });

      await expect(
        acceptBooking({
          userId: "vendor-user-1",
          role: "VENDOR",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("Only pending bookings can be accepted");

      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });
  });

  describe("rejectBooking", () => {
    test("rejects a pending booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "REJECTED",
      });

      const result = await rejectBooking({
        userId: "vendor-user-1",
        role: "VENDOR",
        bookingId: "booking-1",
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: { status: "REJECTED" },
      });
      expect(result.status).toBe("REJECTED");
    });

    test("fails when completed booking is rejected", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "COMPLETED",
      });

      await expect(
        rejectBooking({
          userId: "vendor-user-1",
          role: "VENDOR",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("Only pending bookings can be rejected");

      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });
  });

  describe("cancelBooking", () => {
    test("cancels a pending booking and sets cancelledAt", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "PENDING",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "CANCELLED",
        cancelledAt: new Date("2026-05-30T10:00:00.000Z"),
      });

      const result = await cancelBooking({
        userId: "customer-1",
        role: "CUSTOMER",
        bookingId: "booking-1",
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: {
          status: "CANCELLED",
          cancelledAt: expect.any(Date),
        },
      });
      expect(result.status).toBe("CANCELLED");
    });

    test("fails when customer does not own booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-2",
        status: "PENDING",
      });

      await expect(
        cancelBooking({
          userId: "customer-1",
          role: "CUSTOMER",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("You do not have permission to cancel this booking");

      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    test("fails when completed booking is cancelled", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "COMPLETED",
      });

      await expect(
        cancelBooking({
          userId: "customer-1",
          role: "CUSTOMER",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("Only pending or accepted bookings can be cancelled");
    });
  });

  describe("completeBooking", () => {
    test("completes an accepted booking and sets completedAt", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "ACCEPTED",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "COMPLETED",
        completedAt: new Date("2026-05-30T10:00:00.000Z"),
      });

      const result = await completeBooking({
        userId: "vendor-user-1",
        role: "VENDOR",
        bookingId: "booking-1",
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: {
          status: "COMPLETED",
          completedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe("COMPLETED");
    });

    test("fails when pending booking is completed", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });

      await expect(
        completeBooking({
          userId: "vendor-user-1",
          role: "VENDOR",
          bookingId: "booking-1",
        })
      ).rejects.toThrow("Only accepted bookings can be completed");

      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });
  });
});
