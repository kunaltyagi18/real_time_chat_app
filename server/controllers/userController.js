import { generateToken } from "../config/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";


// =============================
// 1️⃣ SIGNUP
// =============================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic || null,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error creating account",
    });
  }
};



// =============================
// 2️⃣ LOGIN
// =============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userData.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      token,
      userData: {
        _id: userData._id,
        fullName: userData.fullName,
        email: userData.email,
        bio: userData.bio,
        profilePic: userData.profilePic || null,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};



// =============================
// 3️⃣ CHECK AUTH
// =============================
export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};



// =============================
// 4️⃣ UPDATE PROFILE (Multer)
// =============================
export const updateProfile = async (req, res) => {
  try {
    const { bio, fullName } = req.body;
    const userId = req.user._id;

    let profilePicUrl;

    // If image uploaded using multer
    if (req.file) {
      profilePicUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        ...(profilePicUrl && { profilePic: profilePicUrl }),
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};