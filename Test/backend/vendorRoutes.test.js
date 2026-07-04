const jwt = require("jsonwebtoken");
const request = require("supertest");

const mockPrisma = {
  vendorProfile: {
    findUnique: jest.fn(),
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

describe("vendor routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/vendors/:id", () => {
    const vendorDetails = {
      id: "vendor-1",
      businessName: "John Studios",
      bio: "Professional Photographer",
      location: "Abuja",
      userId: "user-1",
      isVerified: true,
      createdAt: "2026-05-27T00:00:00.000Z",
      user: { name: "John Doe" },
      services: [
        {
          id: "service-1",
          name: "Wedding Photograph",
          reviews: [
            { id: "review-1", rating: 5 },
            { id: "review-2", rating: 4 },
            { id: "review-3", rating: 3 },
          ]
        },
        {
          id: "service-2",
          name: "Birthday Photoshot",
          reviews: [
            { id: "review-1", rating: 5 },
            { id: "review-2", rating: 4 },
            { id: "review-3", rating: 3 },
          ]
        },
      ],
      reviews: [
        {
          id: "review-1",
          rating: 5,
          comment: "Great work John",
          userId: "user-1",
          createdAt: "2026-05-27T00:00:00.000Z"
        },
        {
          id: "review-2",
          rating: 4,
          comment: "John is good at what he does",
          userId: "user-2",
          createdAt: "2026-05-27T00:00:00.000Z"
        }
      ]
    }

    const expectedVendorQuery = {
        where: { id: "vendor-1" },
        include: {
            user: {
                select: {
                    name: true,
                },
            },
            services: {
              where: {
                isArchived: false,
              },
              include: {
                images: true,
                category: true,
                reviews: true,
                vendor: {
                  select: {
                    businessName: true,
                    location: true,
                  }
                }
              }
            },
            reviews: {
              include: {
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            },
        }
    }

    test("should successfully fetch vendor by id", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorDetails);

      const res = await request(app).get("/api/vendors/vendor-1");
      expect(res.status).toBe(200);
      expect(res.body.vendorProfile).toMatchObject({
        id: "vendor-1",
        businessName: "John Studios",
        bio: "Professional Photographer",
        location: "Abuja",
        userId: "user-1",
        isVerified: true,
        createdAt: "2026-05-27T00:00:00.000Z",
        user: { name: "John Doe" },
      })
      expect(mockPrisma.vendorProfile.findUnique).toHaveBeenCalledWith(expectedVendorQuery);
    })

    test("should calculate service review statistics correctly", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue({
        ...vendorDetails,
        services: [
          {
            ...vendorDetails.services[0],
            reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }]
          }
        ]
      })

      const res = await request(app).get("/api/vendors/vendor-1");
      expect(res.status).toBe(200);
      expect(res.body.vendorProfile.services[0].reviewStats).toEqual({
        averageRating: 4.7,
        totalReviews: 3,
      });
    });

    test("should return 404 if vendor not found", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue(null);

      const res = await request(app).get("/api/vendors/vendor-1");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Vendor not found" });
      expect(mockPrisma.vendorProfile.findUnique).not.toHaveBeenCalledWith();
    })
  })
});