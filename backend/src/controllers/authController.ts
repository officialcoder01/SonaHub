/////////////////////////////////////
// This controller handles user authentication,
// including registration and login.
////////////////////////////////////
import type { User, Role } from "@prisma/client"
import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService.js";

interface AuthResponse {
  user: User;
  token: string;
}

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const buildAuthResponse = (result: AuthResponse) => {
  // Passwords should never leave the server, even in hashed form.
  const { password, ...safeUser } = result.user;

  return {
    token: result.token,
    user: safeUser,
  };
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body as RegisterRequestBody);
    res.status(201).json(buildAuthResponse(result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred during user registration";

    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body as LoginRequestBody);
    res.status(200).json(buildAuthResponse(result));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unknown error occurred during user login";

    res.status(400).json({ message });
  }
};
