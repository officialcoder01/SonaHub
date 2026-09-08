const jwt = require("jsonwebtoken");
const request = require("supertest");

const mockPrisma = {
    service: {
        count: jest.fn(),
    },
    vendorProfile: {
        count: jest.fn(),
        findMany: jest.fn(),
    },
    user: {
        count: jest.fn(),
    },
    activity: {
        findMany: jest.fn(),
    },
    category: {
        findMany: jest.fn(),
    }
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

const adminAuth = authHeader({ id: "ADMIN-1", role: "ADMIN" });

describe("admin routes", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("GET /api/admin/dashboard", () => {
        test("return stats, recent activies, and service counts by category", async () => {
            const response = {
                stats: {
                    totalUsers: 200,
                    pendingVerification: 50,
                    verifiedVendors: 50,
                    totalServices: 500
                },
                pendingVendors: [
                    {
                        id: "USER-1",
                        name: "John Doe",
                        email: "johndoe@example.com",
                        createdAt: "2026-05-31T10:00:00.000Z"
                    },
                    {
                        id: "USER-2",
                        name: "Jane Doe",
                        email: "janedoe@example.com",
                        createdAt: "2026-05-30T10:00:00.000Z"
                    }
                ],
                recentActivities: [
                    {
                        adminId: "ADMIN-1",
                        type: "Registration",
                        message: "New User registered",
                        createdAt: "2026-05-30T10:00:00.000Z",
                    },
                    
                    {
                        adminId: "ADMIN-1",
                        type: "Verification",
                        message: "New Verification Request",
                        createdAt: "2026-05-30T10:00:00.000Z",
                    },
                ],
                servicesByCategory: [
                    {
                        id: "category-1",
                        name: "Tailoring",
                        _count: {
                            services: 50
                        }
                    },
                    {
                        id: "category-2",
                        name: "Baking",
                        _count: {
                            services: 30
                        }
                    }
                ]
            };

            mockPrisma.user.count.mockResolvedValue(response.stats.totalUsers);
            mockPrisma.vendorProfile.count.mockResolvedValue(response.stats.pendingVerification);
            mockPrisma.vendorProfile.count.mockResolvedValue(response.stats.verifiedVendors);
            mockPrisma.service.count.mockResolvedValue(response.stats.totalServices);
            mockPrisma.vendorProfile.findMany.mockResolvedValue(response.pendingVendors);
            mockPrisma.activity.findMany.mockResolvedValue(response.recentActivities);
            mockPrisma.category.findMany.mockResolvedValue(response.servicesByCategory);

            const res = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", adminAuth);
            
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject(response);
        });

        test("deny access to dashboard if not admin", async () => {
            const res = await request(app)
                .get("/api/admin/dashboard")
                .set("Authorization", authHeader({ id: "User-1", role: "VENDOR" }))

            expect(res.status).toBe(403);
            expect(res.body.message).toBe("You don't have permission!");
            expect(mockPrisma.user.count).not.toHaveBeenCalled();
            expect(mockPrisma.vendorProfile.count).not.toHaveBeenCalled();
            expect(mockPrisma.service.count).not.toHaveBeenCalled();
            expect(mockPrisma.activity.findMany).not.toHaveBeenCalled();
            expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
        })
    })
})
