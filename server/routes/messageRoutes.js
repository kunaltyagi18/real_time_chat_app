import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/Upload.js";
import {
  getUsers,
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

// Send message (text + optional image)
messageRouter.post(
  "/send/:id",
  protectRoute,
  upload.single("image"),
  sendMessage
);

export default messageRouter;