/////////////////////////////
// This utility function generates a JSON Web Token (JWT)
// for a given user.
////////////////////////////

import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

interface TokenPayload {
  id: string;
  role: string;
}

export const generateToken = (user: User) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: user.id, role: user.role } as TokenPayload,
    secret,
    { expiresIn: "7d" }
  );
};