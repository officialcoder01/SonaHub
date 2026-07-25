const jwt = require("jsonwebtoken");
const request = require("supertest");

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
    groupBy: jest.fn(),
  },
};

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("../../backend/src/config/cloudinary.js", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload_stream: jest.fn(),
    },
    v2: {
      uploader: {
        upload_stream: jest.fn(),
      },
    },
  },
}));

process.env.JWT_SECRET = "test-secret";

const app = require("../../backend/src/app.js").default;

const authHeader = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return `Bearer ${token}`;
};

const customerAuth = authHeader({ id: "customer-1", role: "CUSTOMER" });
const otherCustomerAuth = authHeader({ id: "customer-2", role: "CUSTOMER" });
const vendorAuth = authHeader({ id: "vendor-user-1", role: "VENDOR" });
const otherVendorAuth = authHeader({ id: "vendor-user-2", role: "VENDOR" });

describe("booking routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/bookings", () => {
    test("creates booking successfully", async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        id: "service-1",
        vendorId: "vendor-1",
        vendor: { userId: "vendor-user-1" },
      });
      mockPrisma.booking.create.mockResolvedValue({
        id: "booking-1",
        status: "PENDING",
      });

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", customerAuth)
        .send({
          serviceId: "service-1",
          message: "Need this completed next week",
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: "booking-1",
        status: "PENDING",
      });
    });

    test("fails when service does not exist", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", customerAuth)
        .send({ serviceId: "missing-service" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Service not found");
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    test("fails when unauthenticated", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({ serviceId: "service-1" });

      expect(res.status).toBe(401);
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    test("fails when vendor tries to book own service", async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        id: "service-1",
        vendorId: "vendor-1",
        vendor: { userId: "vendor-user-1" },
      });

      mockPrisma.booking.create.mockResolvedValue({
        id: "booking-1",
        status: "PENDING",
      });
      
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", vendorAuth)
        .send({ serviceId: "service-1" });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Vendors cannot book their own services");
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/bookings/my", () => {
    test("returns only customer bookings", async () => {
      const bookings = [
        {
          id: "booking-1",
          customerId: "customer-1",
          status: "PENDING",
          createdAt: "2026-05-30T00:00:00.000Z",
          service: { id: "service-1", title: "Photography" },
          vendor: { id: "vendor-1", businessName: "Jane Studios" },
        },
      ];
      mockPrisma.booking.findMany.mockResolvedValue(bookings);

      const res = await request(app)
        .get("/api/bookings/my")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ bookings });
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: { customerId: "customer-1" },
        include: {
          service: {
            include: {
              images: true,
            },
          },
          vendor: true,
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    test("fails when unauthenticated", async () => {
      const res = await request(app).get("/api/bookings/my");

      expect(res.status).toBe(401);
      expect(mockPrisma.booking.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/vendor/bookings", () => {
    test("returns vendor bookings", async () => {
      const bookings = [
        {
          id: "booking-1",
          vendorId: "vendor-1",
          status: "PENDING",
          customer: { id: "customer-1", name: "Jane Doe" },
          service: { id: "service-1", title: "Photography" },
        },
      ];
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findMany.mockResolvedValue(bookings);
      mockPrisma.booking.groupBy.mockResolvedValue([{ status: "PENDING", _count: { status: 1 } }]);

      const res = await request(app)
        .get("/api/vendor/bookings")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        bookings,
        statusCounts: {
          pending: 1,
          accepted: 0,
          completed: 0,
          rejected: 0,
          cancelled: 0,
        },
      });
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: { vendorId: "vendor-1" },
        include: {
          customer: true,
          service: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    test("fails for customer access", async () => {
      const res = await request(app)
        .get("/api/vendor/bookings")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Only vendors can manage their bookings");
      expect(mockPrisma.booking.findMany).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/vendor/bookings/:id/accept", () => {
    test("accepts pending booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "ACCEPTED",
        acceptedAt: "2026-05-30T10:00:00.000Z",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/accept")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("ACCEPTED");
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: "booking-1" },
        data: {
          status: "ACCEPTED",
          acceptedAt: expect.any(Date),
        },
      });
    });

    test("fails when booking is not owned by vendor", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-2" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/accept")
        .set("Authorization", otherVendorAuth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You do not have permission to manage this booking");
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    test("fails when booking already accepted", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "ACCEPTED",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/accept")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only pending bookings can be accepted");
    });

    test("fails when booking cancelled", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "CANCELLED",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/accept")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only pending bookings can be accepted");
    });
  });

  describe("PATCH /api/vendor/bookings/:id/reject", () => {
    test("rejects pending booking", async () => {
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

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/reject")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("REJECTED");
    });

    test("fails when booking is not owned", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-2" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/reject")
        .set("Authorization", otherVendorAuth);

      expect(res.status).toBe(403);
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
    });

    test("fails when booking already completed", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "COMPLETED",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/reject")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only pending bookings can be rejected");
    });
  });

  describe("PATCH /api/bookings/:id/cancel", () => {
    test("customer cancels pending booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "PENDING",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "CANCELLED",
        cancelledAt: "2026-05-30T10:00:00.000Z",
      });

      const res = await request(app)
        .patch("/api/bookings/booking-1/cancel")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("CANCELLED");
    });

    test("customer cancels accepted booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "ACCEPTED",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "CANCELLED",
        cancelledAt: "2026-05-30T10:00:00.000Z",
      });

      const res = await request(app)
        .patch("/api/bookings/booking-1/cancel")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(200);
      expect(res.body.booking.cancelledAt).toBeTruthy();
    });

    test("customer cannot cancel completed booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "COMPLETED",
      });

      const res = await request(app)
        .patch("/api/bookings/booking-1/cancel")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only pending or accepted bookings can be cancelled");
    });

    test("customer cannot cancel rejected booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "REJECTED",
      });

      const res = await request(app)
        .patch("/api/bookings/booking-1/cancel")
        .set("Authorization", customerAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only pending or accepted bookings can be cancelled");
    });

    test("customer cannot cancel another user's booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        customerId: "customer-1",
        status: "PENDING",
      });

      const res = await request(app)
        .patch("/api/bookings/booking-1/cancel")
        .set("Authorization", otherCustomerAuth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You do not have permission to cancel this booking");
    });
  });

  describe("PATCH /api/vendor/bookings/:id/complete", () => {
    test("vendor completes accepted booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "ACCEPTED",
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: "booking-1",
        status: "COMPLETED",
        completedAt: "2026-05-30T10:00:00.000Z",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/complete")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe("COMPLETED");
    });

    test("vendor cannot complete pending booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "PENDING",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/complete")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only accepted bookings can be completed");
    });

    test("vendor cannot complete cancelled booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "CANCELLED",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/complete")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only accepted bookings can be completed");
    });

    test("vendor cannot complete rejected booking", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({ id: "vendor-1" });
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: "booking-1",
        vendorId: "vendor-1",
        status: "REJECTED",
      });

      const res = await request(app)
        .patch("/api/vendor/bookings/booking-1/complete")
        .set("Authorization", vendorAuth);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only accepted bookings can be completed");
    });
  });
});
