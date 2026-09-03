////////////////////////////////////////
// Authentication service
///////////////////////////////////////

import bcrypt from "bcrypt";
import type { Role, User } from "@prisma/client";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthResult = {
  user: User;
  token: string;
};

// Service function to handle user registration
export const registerUser = async (
  data: RegisterInput
): Promise<AuthResult> => {
  const { name, email, password, role = "CUSTOMER" } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return {
    user,
    token: generateToken(user),
  };
};

// Service function to handle user login
export const loginUser = async ({
  email,
  password
}: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return {
    user,
    token: generateToken(user),
  };
};
