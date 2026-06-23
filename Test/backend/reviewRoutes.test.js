const jwt = require("jsonwebtoken");
const request = require("supertest");

///////////////////////////////////////////////////////////
// Mock Prisma before importing the app so that no real
// database connections are made during test execution.
///////////////////////////////////////////////////////////
const mockPrisma = {
  booking: {
    findUnique: jest.fn(),
  },
  review: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Cloudinary is imported transitively — mock it to avoid
// any file-upload side effects during tests.
jest.mock("../../backend/src/config/cloudinary.js", () => ({
  __esModule: true,
  default: {
    uploader: { upload_stream: jest.fn() },
    v2: { uploader: { upload_stream: jest.fn() } },
  },
}));

process.env.JWT_SECRET = "test-secret";

const app = require("../../backend/src/app.js").default;

///////////////////////////////////////////////////////////
// Token helpers — mirror the pattern in bookingRoutes.test.js.
// UUIDs are used throughout because the validator enforces
// isUUID() on bookingId; non-UUID strings would be rejected
// at the validation layer before reaching the service.
///////////////////////////////////////////////////////////
const authHeader = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return `Bearer ${token}`;
};

// UUID v4 identifiers used as stable test fixtures
const CUSTOMER_1_ID   = "00000000-0000-4000-a000-000000000001";
const CUSTOMER_2_ID   = "00000000-0000-4000-a000-000000000002";
const VENDOR_USER_ID  = "00000000-0000-4000-a000-000000000003";
const VENDOR_ID       = "00000000-0000-4000-a000-000000000004";
const SERVICE_ID      = "00000000-0000-4000-a000-000000000005";
const BOOKING_ID      = "00000000-0000-4000-a000-000000000006";
const BOOKING_MISSING = "00000000-0000-4000-a000-000000000007";
const REVIEW_ID       = "00000000-0000-4000-a000-000000000008";

const customerAuth      = authHeader({ id: CUSTOMER_1_ID, role: "CUSTOMER" });
const otherCustomerAuth = authHeader({ id: CUSTOMER_2_ID, role: "CUSTOMER" });
const vendorAuth        = authHeader({ id: VENDOR_USER_ID, role: "VENDOR" });

///////////////////////////////////////////////////////////
// Reusable fixture: a completed booking owned by CUSTOMER_1_ID
///////////////////////////////////////////////////////////
const completedBooking = {
  id: BOOKING_ID,
  customerId: CUSTOMER_1_ID,
  vendorId: VENDOR_ID,
  serviceId: SERVICE_ID,
  status: "COMPLETED",
  service: { id: SERVICE_ID, title: "Photography" },
};

///////////////////////////////////////////////////////////
// Reusable fixture: the review that Prisma returns after
// a successful create call
///////////////////////////////////////////////////////////
const createdReview = {
  id: REVIEW_ID,
  bookingId: BOOKING_ID,
  userId: CUSTOMER_1_ID,
  vendorId: VENDOR_ID,
  serviceId: SERVICE_ID,
  rating: 5,
  comment: "Excellent service",
  createdAt: "2026-06-15T00:00:00.000Z",
  user: { id: CUSTOMER_1_ID, name: "Jane Doe" },
  vendor: { id: VENDOR_ID, businessName: "Artisan Studios" },
  service: { id: SERVICE_ID, title: "Photography" },
};

describe("POST /api/reviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ///////////////////////////////////////////////////////////
  // SUCCESS CASES
  ///////////////////////////////////////////////////////////

  describe("success cases", () => {
    test("authenticated customer submits review for completed booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null); // no prior review
      mockPrisma.review.create.mockResolvedValue(createdReview);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({
          bookingId: BOOKING_ID,
          rating: 5,
          comment: "Excellent service",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Review submitted successfully");
      expect(res.body.review).toMatchObject({
        id: REVIEW_ID,
        rating: 5,
        comment: "Excellent service",
      });
    });

    test("review is accepted when comment is omitted", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null);
      // Simulate prisma returning a review with null comment
      mockPrisma.review.create.mockResolvedValue({
        ...createdReview,
        comment: null,
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({
          bookingId: BOOKING_ID,
          rating: 4,
          // comment intentionally omitted
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Review submitted successfully");
      expect(res.body.review.comment).toBeNull();
    });

    test("review is created with correct data passed to Prisma", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue(createdReview);

      await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5, comment: "Great" });

      // Verify the service layer passed the correct payload to Prisma.
      expect(mockPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: CUSTOMER_1_ID,
            vendorId: VENDOR_ID,
            serviceId: SERVICE_ID,
            bookingId: BOOKING_ID,
            rating: 5,
            comment: "Great",
          }),
        })
      );
    });
  });

  ///////////////////////////////////////////////////////////
  // AUTHORIZATION TESTS
  ///////////////////////////////////////////////////////////

  describe("authorization", () => {
    test("unauthenticated request returns 401", async () => {
      // No Authorization header — middleware should reject immediately.
      const res = await request(app)
        .post("/api/reviews")
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(401);
      expect(mockPrisma.booking.findUnique).not.toHaveBeenCalled();
    });

    test("customer trying to review another customer's booking returns 403", async () => {
      // Booking belongs to CUSTOMER_1 but the request is made by CUSTOMER_2.
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", otherCustomerAuth) // CUSTOMER_2
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You are not authorized to review this booking");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("vendor attempting to review a booking they do not own returns 403", async () => {
      // Vendor's JWT id (VENDOR_USER_ID) does not match booking.customerId.
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", vendorAuth) // id: VENDOR_USER_ID
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You are not authorized to review this booking");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });
  });

  ///////////////////////////////////////////////////////////
  // BUSINESS RULE TESTS
  ///////////////////////////////////////////////////////////

  describe("business rules", () => {
    test("returns 404 when booking does not exist", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        // BOOKING_MISSING is a valid UUID but resolves to null in Prisma mock
        .send({ bookingId: BOOKING_MISSING, rating: 5 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Booking not found");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 400 when booking status is PENDING", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...completedBooking,
        status: "PENDING",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only completed bookings can be reviewed");
    });

    test("returns 400 when booking status is ACCEPTED", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...completedBooking,
        status: "ACCEPTED",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only completed bookings can be reviewed");
    });

    test("returns 400 when booking status is REJECTED", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...completedBooking,
        status: "REJECTED",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only completed bookings can be reviewed");
    });

    test("returns 400 when booking status is CANCELLED", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...completedBooking,
        status: "CANCELLED",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only completed bookings can be reviewed");
    });

    test("returns 400 when booking status is IN_PROGRESS", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...completedBooking,
        status: "IN_PROGRESS",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Only completed bookings can be reviewed");
    });

    test("returns 409 when a review already exists for this booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      // Simulate a pre-existing review found for this booking.
      mockPrisma.review.findUnique.mockResolvedValue({ id: REVIEW_ID });

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 3 });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("You have already reviewed this booking");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });
  });

  ///////////////////////////////////////////////////////////
  // VALIDATION TESTS
  ///////////////////////////////////////////////////////////

  describe("validation", () => {
    test("returns 422 when rating is below 1", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 0 });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 422 when rating is above 5", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 6 });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 422 when rating is missing", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 422 when bookingId is missing", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ rating: 5 });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 422 when bookingId is not a valid UUID", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: "not-a-uuid", rating: 5 });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    test("returns 422 when rating is a non-integer number", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 4.5 });

      expect(res.status).toBe(422);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });
  });

  ///////////////////////////////////////////////////////////
  // DATABASE ASSERTION TESTS
  ///////////////////////////////////////////////////////////

  describe("database assertions", () => {
    test("review record is linked to user, vendor, service, and booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue(createdReview);

      const res = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5, comment: "Great work" });

      expect(res.status).toBe(201);

      // Confirm the payload sent to Prisma contains all four required links.
      const createCall = mockPrisma.review.create.mock.calls[0][0];
      expect(createCall.data).toMatchObject({
        userId: CUSTOMER_1_ID,
        vendorId: VENDOR_ID,
        serviceId: SERVICE_ID,
        bookingId: BOOKING_ID,
      });
    });

    test("bookingId uniqueness is enforced — duplicate create is never attempted", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking);
      // First call: no review yet. Second call: review already exists.
      mockPrisma.review.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: REVIEW_ID });

      mockPrisma.review.create.mockResolvedValue(createdReview);

      // First review — should succeed.
      const first = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 5 });

      expect(first.status).toBe(201);

      // Second review for the same booking — should be rejected at the
      // service layer before Prisma.review.create is called a second time.
      const second = await request(app)
        .post("/api/reviews")
        .set("Authorization", customerAuth)
        .send({ bookingId: BOOKING_ID, rating: 3 });

      expect(second.status).toBe(409);
      expect(second.body.message).toBe("You have already reviewed this booking");
      // create should have been called exactly once (for the first review only).
      expect(mockPrisma.review.create).toHaveBeenCalledTimes(1);
    });
  });
});
