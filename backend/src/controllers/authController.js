/////////////////////////////////////
// This controller handles user authentication,
// including registration and login.
////////////////////////////////////
import { registerUser, loginUser } from "../services/authService.js";

const buildAuthResponse = (result) => {
  // Passwords should never leave the server, even in hashed form.
  const { password, ...safeUser } = result.user;

  return {
    token: result.token,
    user: safeUser,
  };
};

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(buildAuthResponse(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(buildAuthResponse(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
