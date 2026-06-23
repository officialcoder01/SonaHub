const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  vendorProfile: {
    create: jest.fn(),
  },
};

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockGenerateToken = jest.fn();

jest.mock("../../backend/src/config/prisma.js", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: mockBcrypt,
}));

jest.mock("../../backend/src/utils/generateToken.js", () => ({
  __esModule: true,
  generateToken: mockGenerateToken,
}));

const { registerUser, loginUser } = require("../../backend/src/services/authService.js");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register works", async () => {
    const payload = {
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret123",
      role: "CUSTOMER",
    };

    const createdUser = {
      id: "user-1",
      name: payload.name,
      email: payload.email,
      password: "hashed-password",
      role: payload.role,
    };

    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockBcrypt.hash.mockResolvedValue("hashed-password");
    mockPrisma.user.create.mockResolvedValue(createdUser);
    mockGenerateToken.mockReturnValue("register-token");

    const result = await registerUser(payload);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: payload.email },
    });
    expect(mockBcrypt.hash).toHaveBeenCalledWith(payload.password, 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        email: payload.email,
        password: "hashed-password",
        role: payload.role,
      },
    });
    expect(result).toEqual({
      user: createdUser,
      token: "register-token",
    });
  });

  test("duplicate email fail", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "jane@example.com",
    });

    await expect(
      registerUser({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secret123",
        role: "CUSTOMER",
      })
    ).rejects.toThrow("User already exists");

    expect(mockBcrypt.hash).not.toHaveBeenCalled();
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });

  test("login works", async () => {
    const existingUser = {
      id: "user-1",
      email: "jane@example.com",
      password: "hashed-password",
      role: "CUSTOMER",
    };

    mockPrisma.user.findUnique.mockResolvedValue(existingUser);
    mockBcrypt.compare.mockResolvedValue(true);
    mockGenerateToken.mockReturnValue("login-token");

    const result = await loginUser({
      email: "jane@example.com",
      password: "secret123",
    });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "jane@example.com" },
    });
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      "secret123",
      existingUser.password
    );
    expect(result).toEqual({
      user: existingUser,
      token: "login-token",
    });
  });

  test("wrong password fails", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "jane@example.com",
      password: "hashed-password",
      role: "CUSTOMER",
    });
    mockBcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "jane@example.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("Invalid credentials");

    expect(mockGenerateToken).not.toHaveBeenCalled();
  });
});
