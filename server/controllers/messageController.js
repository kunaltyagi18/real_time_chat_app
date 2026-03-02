import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";


// ===============================
// 1️⃣ Get All Users (Except Me)
// ===============================
export const getUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    const unseenMessages = {};

    await Promise.all(
      filteredUsers.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });

        if (count > 0) {
          unseenMessages[user._id] = count;
        }
      })
    );

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// 2️⃣ Get Messages With Selected User
// ===============================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// 3️⃣ Mark Single Message Seen
// ===============================
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, {
      seen: true,
    });

    res.json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// 4️⃣ Send Message (Cloudinary Version)
// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;

    // 🔥 If image exists → upload to Cloudinary
    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "chat-app" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          streamifier
            .createReadStream(req.file.buffer)
            .pipe(stream);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    // Create message
    const message = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    // 🔥 Emit to receiver if online
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.json({
      success: true,
      newMessage: message,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};