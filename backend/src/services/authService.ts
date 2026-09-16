////////////////////////////////////////
// Authentication service
///////////////////////////////////////

import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { Prisma, User, Role } from "@prisma/client";
import { generateToken } from "../utils/generateToken.js";
import { ActivityType } from "../utils/activityType.js";

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

// Service function to handle user registration
export const registerUser = async (data: RegisterUserData): Promise<AuthResponse> => {
  try {
    const { name, email, password, role="CUSTOMER" } = data;

    const existingUser: User | null = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      await tx.activity.create({
        data: {
          type: ActivityType.USER_REGISTERED,
          entityId: createdUser.id,
          message: `New user registered: ${createdUser.name} (${createdUser.email})`,
        },
      });

      return createdUser;
    });

    const token: string = generateToken(user);

    return { user, token };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred during user registration";

    throw new Error(message);
  }
};

interface LoginUserData {
  email: string;
  password: string;
}

// Service function to handle user login
export const loginUser = async ({ email, password }: LoginUserData): Promise<AuthResponse> => {
  const user: User | null = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("Invalid credentials");

  const isMatch: boolean = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token: string = generateToken(user);

  return { user, token };
};
