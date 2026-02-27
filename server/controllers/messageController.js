import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";


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

    const promises = filteredUsers.map(async (user) => {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (count > 0) {
        unseenMessages[user._id] = count;
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
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

    // mark as seen
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ===============================
// 4️⃣ Send Message (Using Multer)
// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;

    // Multer file handling
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Emit to receiver if online
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.json({
      success: true,
      newMessage: message,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};