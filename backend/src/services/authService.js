////////////////////////////////////////
// Authentication service
///////////////////////////////////////

import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/generateToken.js";

// Service function to handle user registration
export const registerUser = async (data) => {
  try {
    const { name, email, password, role } = data;

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

    const token = generateToken(user);

    return { user, token };
  } catch (err) {
    console.error("Error in registerUser:", err);
    throw new Error(err.message || "Registration failed");
  }
};

// Service function to handle user login
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user);

  return { user, token };
};
