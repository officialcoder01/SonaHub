const mockPrisma = {
  vendorProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  booking: {
    groupBy: jest.fn(),
  }
};

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

const {
  createVendorProfile,
  getVendorProfileByUserId,
  getAllVendors,
} = require("../../backend/src/services/vendorService.js");

describe("vendorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create vendor profile", async () => {
    const payload = {
      userId: "user-1",
      role: "VENDOR",
      businessName: "Jane Events",
      bio: "Premium event planning",
      location: "Lagos",
    };
    const createdProfile = {
      id: "profile-1",
      ...payload,
    };

    mockPrisma.vendorProfile.findUnique.mockResolvedValue(null);
    mockPrisma.vendorProfile.create.mockResolvedValue(createdProfile);

    const result = await createVendorProfile(payload);

    expect(mockPrisma.vendorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: payload.userId },
    });
    expect(mockPrisma.vendorProfile.create).toHaveBeenCalledWith({
      data: {
        userId: payload.userId,
        businessName: payload.businessName,
        bio: payload.bio,
        location: payload.location,
      },
    });
    expect(result).toEqual(createdProfile);
  });

  test("should fail if not vendor", async () => {
    await expect(
      createVendorProfile({
        userId: "user-1",
        role: "CUSTOMER",
        businessName: "Jane Events",
      })
    ).rejects.toThrow("Only vendors can create a vendor profile");

    expect(mockPrisma.vendorProfile.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.vendorProfile.create).not.toHaveBeenCalled();
  });

  test("should fail if profile already exists", async () => {
    mockPrisma.vendorProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "user-1",
    });

    await expect(
      createVendorProfile({
        userId: "user-1",
        role: "VENDOR",
        businessName: "Jane Events",
      })
    ).rejects.toThrow("Vendor profile already exists");

    expect(mockPrisma.vendorProfile.create).not.toHaveBeenCalled();
  });

  test("should return vendor profile", async () => {
    const profile = {
      id: "profile-1",
      userId: "user-1",
      businessName: "Jane Events",
      services: [],
      bookings: [],
      reviews: [],
      _count: {
        services: 0,
        bookings: 0,
      }
    };

    mockPrisma.vendorProfile.findUnique.mockResolvedValue(profile);
    mockPrisma.booking.groupBy.mockResolvedValue([]);

    const result = await getVendorProfileByUserId("user-1", "VENDOR");

    expect(mockPrisma.vendorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: {
        services: {
          where: {
            isArchived: false,
          },
          include: {
            images: true,
            category: true,
          },
        },
        reviews: true,
        _count: {
          select: {
            services: {
              where: { isArchived: false },
            },
            bookings: true,
          }
        }
      },
    });
    expect(result.id).toBe("profile-1");
  });

  test("should return 404 if not created", async () => {
    mockPrisma.vendorProfile.findUnique.mockResolvedValue(null);

    await expect(getVendorProfileByUserId("user-1", "VENDOR")).rejects.toThrow("Vendor not found");

    expect(mockPrisma.vendorProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: {
        services: {
          where: {
            isArchived: false,
          },
          include: {
            images: true,
            category: true,
          },
        },
        reviews: true,
        _count: {
          select: {
            services: {
              where: {
                isArchived: false,
              },
            },
            bookings: true,
          }
        }
      }
    });
  });

  test("should return all vendors", async () => {
    const vendors = [
      {
        id: "profile-1",
        businessName: "Jane Events",
        bio: "Premium event planning",
        location: "Lagos",
        user: { name: "Jane Doe" },
        reviews: [{ rating: 5 }, { rating: 4 }],
        _count: {
          bookings: 10,
        }
      },
      {
        id: "profile-2",
        businessName: "John Catering",
        bio: "Delicious catering services",
        location: "Abuja",
        user: { name: "John Smith" },
        reviews: [{ rating: 5 }, { rating: 4 }],
        _count: {
          bookings: 5,
        }
      },
    ];

    mockPrisma.vendorProfile.findMany.mockResolvedValue(vendors);

    const result = await getAllVendors();

    expect(mockPrisma.vendorProfile.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        businessName: true,
        location: true,
        isVerified: true,
        user: {
          select: {
            name: true,
          },
        },
        reviews: true,
        _count: {
          select: {
            bookings: {
              where: { status: "COMPLETED" }
            }
          }
        },
      },
    });
    expect(result).toMatchObject(vendors);
  });
});
