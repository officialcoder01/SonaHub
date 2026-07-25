const jwt = require("jsonwebtoken");
const request = require("supertest");

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  vendorProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  service: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  review: {
    findMany: jest.fn()
  },
  $transaction: jest.fn(async (callback) => {
    return callback({
      vendorProfile: mockPrisma.vendorProfile,
      service: mockPrisma.service,
    });
  }),
};

let uploadCount = 0;
const legacyUploadStream = jest.fn(() => {
  throw new Error("legacy Cloudinary uploader should not be used");
});
const uploadStream = jest.fn((options, callback) => ({
  end: jest.fn(() => {
    uploadCount += 1;
    callback(null, {
      secure_url: `https://cdn.example.com/service-${uploadCount}.jpg`,
    });
  }),
}));

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("../../backend/src/config/cloudinary.js", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload_stream: legacyUploadStream,
    },
    v2: {
      uploader: {
        upload_stream: uploadStream,
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

const attachImages = (agent, count) => {
  let requestBuilder = agent;

  for (let index = 1; index <= count; index += 1) {
    requestBuilder = requestBuilder.attach(
      "images",
      Buffer.from(`fake-image-${index}`),
      `service-${index}.jpg`
    );
  }

  return requestBuilder;
};

const createServiceRequest = (imageCount = 0) => {
  const agent = request(app)
    .post("/api/services")
    .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }))
    .field("title", "Photography")
    .field("description", "Wedding photography")
    .field("price", "1800")
    .field("categoryId", "category-1");

  return attachImages(agent, imageCount);
};

describe("service routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uploadCount = 0;
  });

  describe("POST /api/services", () => {
    test("should create service without image", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const createdService = {
        id: "service-1",
        vendorId: vendorProfile.id,
        title: "Event Planning",
        description: "Full-service event planning",
        price: 2500,
        categoryId: "category-1",
        images: [],
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.create.mockResolvedValue(createdService);

      const res = await request(app)
        .post("/api/services")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }))
        .field("title", "Event Planning")
        .field("description", "Full-service event planning")
        .field("price", "2500")
        .field("categoryId", "category-1");

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: "Service created successfully",
        service: createdService,
      });
      expect(mockPrisma.vendorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      expect(mockPrisma.service.create).toHaveBeenCalledWith({
        data: {
          vendorId: "vendor-1",
          title: "Event Planning",
          description: "Full-service event planning",
          price: 2500,
          categoryId: "category-1",
        },
        include: {
          images: true,
        },
      });
      expect(uploadStream).not.toHaveBeenCalled();
    });

    test("should create service with one image", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const createdService = {
        id: "service-1",
        vendorId: vendorProfile.id,
        title: "Photography",
        description: "Wedding photography",
        price: 1800,
        categoryId: "category-1",
        images: [{ id: "image-1", url: "https://cdn.example.com/service-1.jpg" }],
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.create.mockResolvedValue(createdService);

      const res = await createServiceRequest(1);

      expect(res.status).toBe(201);
      expect(uploadStream).toHaveBeenCalledTimes(1);
      expect(legacyUploadStream).not.toHaveBeenCalled();
      expect(mockPrisma.service.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          images: {
            create: [{ url: "https://cdn.example.com/service-1.jpg" }],
          },
        }),
        include: {
          images: true,
        },
      });
    });

    test("should create service with two images", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const createdService = {
        id: "service-1",
        vendorId: vendorProfile.id,
        title: "Photography",
        description: "Wedding photography",
        price: 1800,
        categoryId: "category-1",
        images: [
          { id: "image-1", url: "https://cdn.example.com/service-1.jpg" },
          { id: "image-2", url: "https://cdn.example.com/service-2.jpg" },
        ],
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.create.mockResolvedValue(createdService);

      const res = await createServiceRequest(2);

      expect(res.status).toBe(201);
      expect(uploadStream).toHaveBeenCalledTimes(2);
      expect(mockPrisma.service.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          images: {
            create: [
              { url: "https://cdn.example.com/service-1.jpg" },
              { url: "https://cdn.example.com/service-2.jpg" },
            ],
          },
        }),
        include: {
          images: true,
        },
      });
    });

    test("should create service with three images", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const createdService = {
        id: "service-1",
        vendorId: vendorProfile.id,
        title: "Photography",
        description: "Wedding photography",
        price: 1800,
        categoryId: "category-1",
        images: [
          { id: "image-1", url: "https://cdn.example.com/service-1.jpg" },
          { id: "image-2", url: "https://cdn.example.com/service-2.jpg" },
          { id: "image-3", url: "https://cdn.example.com/service-3.jpg" },
        ],
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.create.mockResolvedValue(createdService);

      const res = await createServiceRequest(3);

      expect(res.status).toBe(201);
      expect(uploadStream).toHaveBeenCalledTimes(3);
      expect(mockPrisma.service.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          images: {
            create: [
              { url: "https://cdn.example.com/service-1.jpg" },
              { url: "https://cdn.example.com/service-2.jpg" },
              { url: "https://cdn.example.com/service-3.jpg" },
            ],
          },
        }),
        include: {
          images: true,
        },
      });
    });

    test("should fail if not authenticated", async () => {
      const res = await request(app)
        .post("/api/services")
        .field("title", "Event Planning")
        .field("description", "Full-service event planning")
        .field("price", "2500")
        .field("categoryId", "category-1");

      expect(res.status).toBe(401);
      expect(mockPrisma.service.create).not.toHaveBeenCalled();
    });

    test("should fail if user is not vendor", async () => {
      const res = await request(app)
        .post("/api/services")
        .set("Authorization", authHeader({ id: "user-1", role: "CUSTOMER" }))
        .field("title", "Event Planning")
        .field("description", "Full-service event planning")
        .field("price", "2500")
        .field("categoryId", "category-1");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Only vendors can create services");
      expect(mockPrisma.service.create).not.toHaveBeenCalled();
    });

    test("should fail if vendor has no profile", async () => {
      mockPrisma.vendorProfile.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/services")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }))
        .field("title", "Event Planning")
        .field("description", "Full-service event planning")
        .field("price", "2500")
        .field("categoryId", "category-1");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Vendor profile is required to create services");
      expect(mockPrisma.service.create).not.toHaveBeenCalled();
    });

    test("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/services")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }))
        .field("title", "Event Planning");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("title, description, price, and categoryId are required");
      expect(mockPrisma.vendorProfile.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.service.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/services", () => {
    const services = [
      {
        id: "service-1",
        title: "Photography",
        images: [{ id: "image-1", url: "https://cdn.example.com/service-1.jpg" }],
        reviews: [{ rating: 5 }, { rating: 4 }],
        vendor: {
          businessName: "Jane Studios",
          location: "Lagos",
        },
      },
    ];

    const defaultPublicServicesQuery = {
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 12,
    };

    beforeEach(() => {
      mockPrisma.service.count.mockResolvedValue(1);
      mockPrisma.service.findMany.mockResolvedValue(services);
    });

    test("should return all services public with default pagination", async () => {
      const res = await request(app).get("/api/services");

      expect(res.status).toBe(200);
      expect(res.body.services).toEqual([
        {
          ...services[0],
          reviewStats: {
            averageRating: 4.5,
            totalReviews: 2,
          },
        },
      ]);
      expect(res.body.pagination).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 12,
      });
      expect(mockPrisma.service.count).toHaveBeenCalledWith({
        where: {
          isArchived: false,
        },
      });
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(defaultPublicServicesQuery);
    });

    test("should filter services by category", async () => {
      await request(app).get("/api/services?category=category-1");

      expect(mockPrisma.service.count).toHaveBeenCalledWith({
        where: {
          isArchived: false,
          categoryId: "category-1",
        },
      });
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        where: {
          isArchived: false,
          categoryId: "category-1",
        },
      });
    });

    test("should search services by title case-insensitively", async () => {
      await request(app).get("/api/services?search=photography");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        where: {
          isArchived: false,
          title: {
            contains: "photography",
            mode: "insensitive",
          },
        },
      });
    });

    test("should filter services by vendor location case-insensitively", async () => {
      await request(app).get("/api/services?location=Lagos");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        where: {
          isArchived: false,
          vendor: {
            location: {
              contains: "Lagos",
              mode: "insensitive",
            },
          },
        },
      });
    });

    test("should sort services by newest first", async () => {
      await request(app).get("/api/services?sort=newest");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        orderBy: { createdAt: "desc" },
      });
    });

    test("should sort services by oldest first", async () => {
      await request(app).get("/api/services?sort=oldest");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        orderBy: { createdAt: "asc" },
      });
    });

    test("should return pagination metadata and paginate inside Prisma", async () => {
      mockPrisma.service.count.mockResolvedValue(72);

      const res = await request(app).get("/api/services?page=2&limit=12");

      expect(res.status).toBe(200);
      expect(res.body.pagination).toEqual({
        totalItems: 72,
        totalPages: 6,
        currentPage: 2,
        pageSize: 12,
      });
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        skip: 12,
        take: 12,
      });
    });

    test("should always exclude archived services", async () => {
      await request(app).get("/api/services?search=photo&location=lagos&category=category-1");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        where: expect.objectContaining({
          isArchived: false,
        }),
      });
      expect(mockPrisma.service.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isArchived: false,
        }),
      });
    });

    test("should use default page when page value is invalid", async () => {
      await request(app).get("/api/services?page=0&limit=5");

      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        skip: 0,
        take: 5,
      });
    });

    test("should use default limit when limit value is invalid", async () => {
      const res = await request(app).get("/api/services?page=2&limit=0");

      expect(res.body.pagination).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 2,
        pageSize: 12,
      });
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        ...defaultPublicServicesQuery,
        skip: 12,
        take: 12,
      });
    });

    test("should preserve existing public response shape", async () => {
      const services = [
        {
          id: "service-1",
          title: "Photography",
          images: [{ id: "image-1", url: "https://cdn.example.com/service-1.jpg" }],
          reviews: [{ rating: 5 }, { rating: 4 }],
          vendor: {
            businessName: "Jane Studios",
            location: "Lagos",
          },
        },
      ];

      mockPrisma.service.count.mockResolvedValue(1);
      mockPrisma.service.findMany.mockResolvedValue(services);

      const res = await request(app).get("/api/services");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("services");
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.services[0]).toMatchObject(services[0]);
    });
  });

  describe("GET /api/services/my", () => {
    test("should return vendor services", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const services = [
        {
          id: "service-1",
          vendorId: "vendor-1",
          title: "Photography",
          images: [{ id: "image-1", url: "https://cdn.example.com/service-1.jpg" }],
        },
      ];

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findMany.mockResolvedValue(services);

      const res = await request(app)
        .get("/api/services/my")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ services });
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith({
        where: {
          vendorId: "vendor-1",
          isArchived: false,
        },
        include: {
          images: true,
          category: true,
          vendor: {
            select: {
              businessName: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    test("should fail accessing /my if not authenticated", async () => {
      const res = await request(app).get("/api/services/my");

      expect(res.status).toBe(401);
      expect(mockPrisma.service.findMany).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/services/:id", () => {
    test("should delete a service", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const services = {
        id: "service-1",
        vendorId: "vendor-1",
        title: "Photography",
        isArchived: false,
        vendor: {
          userId: "user-1",
        },
        images: [{ id: "image-1", url: "https://cdn.example.com/service-1.jpg" }],
      };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findUnique.mockResolvedValue(services);

      const res = await request(app)
        .patch("/api/services/service-1")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Service deleted successfully" });
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({
        where: {
          id: "service-1",
          isArchived: false,
        },
        include: {
          vendor: true,
        },
      });
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: "service-1" },
        data: { isArchived: true },
      });
    });
  });

  describe("GET /api/services/:id", () => {
    const serviceDetails = {
      id: "service-1",
      title: "Wedding Photography",
      description: "Natural wedding photography for intimate ceremonies",
      price: 1800,
      createdAt: "2026-05-27T00:00:00.000Z",
      categoryId: "category-1",
      images: [
        { id: "image-1", url: "https://cdn.example.com/service-1.jpg" },
        { id: "image-2", url: "https://cdn.example.com/service-2.jpg" },
      ],
      category: {
        id: "category-1",
        name: "Photography",
      },
      reviews: [
        { id: "review-1", rating: 5 },
        { id: "review-2", rating: 5 },
        { id: "review-3", rating: 3 }
      ],
      vendor: {
        id: "vendor-1",
        businessName: "Jane Studios",
        bio: "Warm documentary-style photography",
        location: "Lagos",
        isVerified: true,
        user: {
          name: "Jane Doe",
        },
        reviews: [
          {
            id: "review-1",
            rating: 5,
            user: {
              name: "John Doe",
            }
          },
          {
            id: "review-2",
            rating: 4,
            user: {
              name: "Chris Doe",
            }
          },
          {
            id: "review-3",
            rating: 3,
            user: {
              name: "Jerry Doe",
            }
          },
        ],
      },
    };

    const serviceDetailsWithNoReviews = {
      id: "service-1",
      title: "Wedding Photography",
      description: "Natural wedding photography for intimate ceremonies",
      price: 1800,
      createdAt: "2026-05-27T00:00:00.000Z",
      categoryId: "category-1",
      images: [
        { id: "image-1", url: "https://cdn.example.com/service-1.jpg" },
        { id: "image-2", url: "https://cdn.example.com/service-2.jpg" },
      ],
      category: {
        id: "category-1",
        name: "Photography",
      },
      vendor: {
        id: "vendor-1",
        businessName: "Jane Studios",
        bio: "Warm documentary-style photography",
        location: "Lagos",
        isVerified: true,
        user: {
          name: "Jane Doe",
        },
        reviews: [
          { id: "review-1", rating: 5 },
          { id: "review-2", rating: 4 },
          { id: "review-3", rating: 3 },
        ],
      },
    };

    const relatedServices = [
      {
        id: "service-2",
        title: "Portrait Photography",
        price: 700,
        images: [{ id: "image-3", url: "https://cdn.example.com/service-3.jpg" }],
        category: {
          id: "category-1",
          name: "Photography",
        },
        vendor: {
          businessName: "Jane Studios",
        },
      },
    ];

    const expectedServiceQuery = {
      where: {
        id: "service-1",
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            reviews: {
              select: { rating: true },
            },
          },
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
      },
    };

    const expectedRelatedServicesQuery = {
      where: {
        categoryId: "category-1",
        id: {
          not: "service-1",
        },
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        vendor: {
          select: {
            businessName: true,
            location: true
          },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    };

    test("should successfully fetch a service by id", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.service).toMatchObject({
        id: "service-1",
        title: "Wedding Photography",
        description: "Natural wedding photography for intimate ceremonies",
        price: 1800,
        createdAt: "2026-05-27T00:00:00.000Z",
      });
      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith(expectedServiceQuery);
    });

    test("should include vendor data", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.service.vendor).toEqual({
        id: "vendor-1",
        businessName: "Jane Studios",
        bio: "Warm documentary-style photography",
        location: "Lagos",
        isVerified: true,
        user: {
          name: "Jane Doe",
        },
        reviewStats: {
          averageRating: 4,
          totalReviews: 3,
        },
      });
    });

    test("should include service review statistics", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);

      expect(res.body.service.reviewStats).toEqual({
        averageRating: 4.3,
        totalReviews: 3,
      });
    });

    test("should return empty review stats when service has no reviews", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetailsWithNoReviews);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      mockPrisma.review.findMany.mockResolvedValue([]);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);

      expect(res.body.service.reviewStats).toEqual({
        averageRating: 0,
        totalReviews: 0,
      });
    });

    test("should include category data", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.service.category).toEqual({
        id: "category-1",
        name: "Photography",
      });
    });

    test("should include service images", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.service.images).toEqual(serviceDetails.images);
    });

    test("should include related services", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(serviceDetails);
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.relatedServices).toMatchObject(relatedServices);
      expect(mockPrisma.service.findMany).toHaveBeenCalledWith(expectedRelatedServicesQuery);
    });

    test("should calculate review statistics correctly", async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        ...serviceDetails,
        vendor: {
          ...serviceDetails.vendor,
          reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
        },
      });
      mockPrisma.service.findMany.mockResolvedValue(relatedServices);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(200);
      expect(res.body.service.vendor.reviewStats).toEqual({
        averageRating: 4.7,
        totalReviews: 3,
      });
    });

    test("should return 404 for non-existent service", async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      const res = await request(app).get("/api/services/service-1");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Service not found" });
      expect(mockPrisma.service.findMany).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/services/:id/pin", () => {
    test("should pin a service for the vendor", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const service = { id: "service-1", vendorId: "vendor-1", isArchived: false, isPinned: false };
      const updatedService = { ...service, isPinned: true };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(service);
      mockPrisma.service.count.mockResolvedValue(2);
      mockPrisma.service.update.mockResolvedValue(updatedService);

      const res = await request(app)
        .patch("/api/services/service-1/pin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedService);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.service.findFirst).toHaveBeenCalledWith({
        where: { id: "service-1", vendorId: "vendor-1", isArchived: false },
      });
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: "service-1" },
        data: { isPinned: true },
      });
    });

    test("should not allow vendor to pin more than 5 services", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const service = { id: "service-1", vendorId: "vendor-1", isArchived: false, isPinned: false };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(service);
      mockPrisma.service.count.mockResolvedValue(5);

      const res = await request(app)
        .patch("/api/services/service-1/pin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("You can only pin up to 5 services at a time.");
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });

    test("should return existing service when already pinned", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const service = { id: "service-1", vendorId: "vendor-1", isArchived: false, isPinned: true };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(service);

      const res = await request(app)
        .patch("/api/services/service-1/pin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual(service);
      expect(mockPrisma.service.count).not.toHaveBeenCalled();
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });

    test("should return 404 for pinned service when vendor does not own it or it is archived", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(null);

      const res = await request(app)
        .patch("/api/services/service-1/pin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Service not found or not owned by vendor");
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/services/:id/unpin", () => {
    test("should unpin a service for the vendor", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const service = { id: "service-1", vendorId: "vendor-1", isArchived: false, isPinned: true };
      const updatedService = { ...service, isPinned: false };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(service);
      mockPrisma.service.update.mockResolvedValue(updatedService);

      const res = await request(app)
        .patch("/api/services/service-1/unpin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedService);
      expect(mockPrisma.service.update).toHaveBeenCalledWith({
        where: { id: "service-1" },
        data: { isPinned: false },
      });
    });

    test("should return existing service when it is already unpinned", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };
      const service = { id: "service-1", vendorId: "vendor-1", isArchived: false, isPinned: false };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(service);

      const res = await request(app)
        .patch("/api/services/service-1/unpin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(200);
      expect(res.body).toEqual(service);
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });

    test("should return 404 when unpinning a service that is archived or not owned", async () => {
      const vendorProfile = { id: "vendor-1", userId: "user-1" };

      mockPrisma.vendorProfile.findUnique.mockResolvedValue(vendorProfile);
      mockPrisma.service.findFirst.mockResolvedValueOnce(null);

      const res = await request(app)
        .patch("/api/services/service-1/unpin")
        .set("Authorization", authHeader({ id: "user-1", role: "VENDOR" }));

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Service not found or not owned by vendor");
      expect(mockPrisma.service.update).not.toHaveBeenCalled();
    });
  });
});
