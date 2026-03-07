import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

import User from "./models/User.js";

// ============================================
// SEED FILE - Test users MongoDB mein add karo
// Usage: node seed.js
// ============================================

const testUsers = [
  {
    fullName: "Rahul Sharma",
    email: "rahul@test.com",
    password: "123456",
    bio: "Hey there! I am using ChatFlow 👋",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
  },
  {
    fullName: "Priya Singh",
    email: "priya@test.com",
    password: "123456",
    bio: "Available for chat 😊",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
  },
  {
    fullName: "Amit Kumar",
    email: "amit@test.com",
    password: "123456",
    bio: "Busy but will reply soon!",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit",
  },
  {
    fullName: "Sneha Patel",
    email: "sneha@test.com",
    password: "123456",
    bio: "Love to chat! 💬",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=sneha",
  },
  {
    fullName: "Rohan Verma",
    email: "rohan@test.com",
    password: "123456",
    bio: "Developer by day, gamer by night 🎮",
    profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=rohan",
  },
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI .env mein set nahi hai!");
    }

    console.log("⏳ MongoDB se connect ho raha hoon...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected!");

    // Purana username_1 index drop karo (yahi error ka reason tha)
    try {
      await User.collection.dropIndex("username_1");
      console.log("🧹 Purana username index drop ho gaya");
    } catch (e) {
      // Index exist nahi karta - bilkul theek hai
    }

    // Purane test users delete karo (fresh start)
    const emails = testUsers.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log("🗑️  Purane test users delete ho gaye");

    // Passwords hash karo aur users insert karo
    const usersToInsert = await Promise.all(
      testUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await User.insertMany(usersToInsert);

    console.log("\n✅ Test users successfully add ho gaye!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    testUsers.forEach((u) => {
      console.log(`👤 ${u.fullName}`);
      console.log(`   Email   : ${u.email}`);
      console.log(`   Password: ${u.password}`);
      console.log("");
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\nAb inme se kisi bhi account se login karo! 🚀\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
};

seedDB();