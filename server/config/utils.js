import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );
};