const request = require("supertest");

const mockPrisma = {
  review: {
    groupBy: jest.fn(),
  },
  vendorProfile: {
    findMany: jest.fn(),
  },
};

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("../../backend/src/config/cloudinary.js", () => ({
  __esModule: true,
  default: {
    uploader: { upload_stream: jest.fn() },
    v2: { uploader: { upload_stream: jest.fn() } },
  },
}));

const app = require("../../backend/src/app.js").default;

describe("GET /api/recommendations/top-rated-vendors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns the top 3 highest-rated vendors and uses review count to break ties", async () => {
    mockPrisma.review.groupBy.mockResolvedValue([
      { vendorId: "vendor-2", _avg: { rating: 4.7 }, _count: { rating: 5 } },
      { vendorId: "vendor-1", _avg: { rating: 4.7 }, _count: { rating: 3 } },
      { vendorId: "vendor-3", _avg: { rating: 4.5 }, _count: { rating: 8 } },
      { vendorId: "vendor-4", _avg: { rating: 4.4 }, _count: { rating: 10 } },
    ]);

    mockPrisma.vendorProfile.findMany.mockResolvedValue([
      { id: "vendor-2", businessName: "Studio Two", location: "Lagos", isVerified: true, user: { name: "Bola" }, _count: { bookings: 5}, },
      { id: "vendor-1", businessName: "Studio One", location: "Abuja", isVerified: false, user: { name: "Ada" }, _count: { bookings: 5}, },
      { id: "vendor-3", businessName: "Studio Three", location: "Kano", isVerified: true, user: { name: "Tunde" }, _count: { bookings: 5}, },
      { id: "vendor-4", businessName: "Studio Four", location: "Port Harcourt", isVerified: true, user: { name: "Mina" }, _count: { bookings: 5}, },
    ]);

    const res = await request(app).get("/api/recommendations/top-rated-vendors");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((vendor) => vendor.id)).toEqual(["vendor-2", "vendor-1", "vendor-3"]);
  });

  test("returns fewer than three vendors when fewer exist", async () => {
    mockPrisma.review.groupBy.mockResolvedValue([
      { vendorId: "vendor-2", _avg: { rating: 4.8 }, _count: { rating: 6 } },
      { vendorId: "vendor-1", _avg: { rating: 4.2 }, _count: { rating: 2 } },
    ]);

    mockPrisma.vendorProfile.findMany.mockResolvedValue([
      { id: "vendor-2", businessName: "Studio Two", location: "Lagos", isVerified: true, user: { name: "Bola" }, _count: { bookings: 5}, },
      { id: "vendor-1", businessName: "Studio One", location: "Abuja", isVerified: false, user: { name: "Ada" }, _count: { bookings: 5}, },
    ]);

    const res = await request(app).get("/api/recommendations/top-rated-vendors");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe("vendor-2");
    expect(res.body[1].id).toBe("vendor-1");
  });

  test("returns the correct average rating, review count, and only required vendor fields", async () => {
    mockPrisma.review.groupBy.mockResolvedValue([
      { vendorId: "vendor-1", _avg: { rating: 4.5 }, _count: { rating: 2 } },
    ]);

    mockPrisma.vendorProfile.findMany.mockResolvedValue([
      { id: "vendor-1", businessName: "Studio One", location: "Abuja", isVerified: false, user: { name: "Ada" }, _count: { bookings: 5}, extraField: "should-not-appear" },
    ]);

    const res = await request(app).get("/api/recommendations/top-rated-vendors");

    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      id: "vendor-1",
      businessName: "Studio One",
      location: "Abuja",
      isVerified: false,
      user: { name: "Ada" },
      completedJobs: 5,
      averageRating: 4.5,
      reviewCount: 2,
    });
    expect(Object.keys(res.body[0]).sort()).toEqual(["averageRating", "businessName", "completedJobs", "id", "isVerified", "location", "reviewCount", "user"]);
  });

  test("excludes vendors that have no reviews", async () => {
    mockPrisma.review.groupBy.mockResolvedValue([
      { vendorId: "vendor-2", _avg: { rating: 4.9 }, _count: { rating: 4 } },
    ]);

    mockPrisma.vendorProfile.findMany.mockResolvedValue([
      { id: "vendor-2", businessName: "Studio Two", location: "Lagos", isVerified: true, user: { name: "Bola" }, _count: { bookings: 0}, },
      { id: "vendor-1", businessName: "Studio One", location: "Abuja", isVerified: false, user: { name: "Ada" }, _count: { bookings: 2}, },
    ]);

    const res = await request(app).get("/api/recommendations/top-rated-vendors");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe("vendor-2");
    expect(res.body.some((vendor) => vendor.id === "vendor-1")).toBe(false);
  });
});
