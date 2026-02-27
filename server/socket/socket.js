import Message from "../models/Message.js";
import User from "../models/User.js";

export const initializeSocket = (io) => {
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ===============================
    // JOIN
    // ===============================
    socket.on("join", async (userId) => {
      try {
        socket.userId = userId; // ✅ store on socket
        onlineUsers[userId] = socket.id;

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
        });

        io.emit("online-users", Object.keys(onlineUsers));
      } catch (error) {
        console.log(error.message);
      }
    });

    // ===============================
    // SEND MESSAGE
    // ===============================
    socket.on("send-message", async ({ receiverId, text, image }) => {
      try {
        const senderId = socket.userId; // ✅ get from socket

        if (!senderId || !receiverId) return;

        const message = await Message.create({
          senderId,
          receiverId,
          text: text || "",
          image: image || "",
        });

        // send to receiver
        const receiverSocket = onlineUsers[receiverId];
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive-message", message);
        }

        // optional: send back to sender
        socket.emit("receive-message", message);

      } catch (error) {
        console.log(error.message);
      }
    });

    // ===============================
    // MARK SEEN
    // ===============================
    socket.on("mark-seen", async ({ msgId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(msgId, {
          seen: true,
        });

        const senderSocket = onlineUsers[senderId];

        if (senderSocket) {
          io.to(senderSocket).emit("message-seen", msgId);
        }

      } catch (error) {
        console.log(error.message);
      }
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on("disconnect", async () => {
      try {
        const userId = socket.userId;

        if (userId) {
          delete onlineUsers[userId];

          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
        }

        io.emit("online-users", Object.keys(onlineUsers));
        console.log("User disconnected:", socket.id);

      } catch (error) {
        console.log(error.message);
      }
    });
  });
};