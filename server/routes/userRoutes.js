import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
} from "../controllers/userController.js";

import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../config/upload.js";

const userRouter = express.Router();

// Signup
userRouter.post("/signup", signup);

// Login
userRouter.post("/login", login);

// Check Auth
userRouter.get("/check", protectRoute, checkAuth);

// Update Profile (with optional image)
userRouter.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);

export default userRouter;