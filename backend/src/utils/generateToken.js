/////////////////////////////
// This utility function generates a JSON Web Token (JWT)
// for a given user.
////////////////////////////

import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};