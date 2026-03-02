import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
} from "../controllers/userController.js";

import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/Upload.js";

const userRouter = express.Router();

// Signup
userRouter.post("/signup", signup);

// Login
userRouter.post("/login", login);

// Check Auth
userRouter.get("/check", protectRoute, checkAuth);

// Update Profile (text + optional image)
userRouter.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"), // must match frontend field name
  updateProfile
);

export default userRouter;