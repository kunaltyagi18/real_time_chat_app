import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../config/upload.js"; // ✅ multer import
import {
  getUsers,              // ✅ correct name
  getMessages,
  markMessagesAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

// Sidebar users
messageRouter.get("/sidebar", protectRoute, getUsers);

// Get messages with selected user
messageRouter.get("/:id", protectRoute, getMessages);

// Mark message as seen
messageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);

// Send message (with optional image)
messageRouter.post(
  "/send/:id",
  protectRoute,
  upload.single("image"),  // ✅ multer middleware added
  sendMessage
);

export default messageRouter;