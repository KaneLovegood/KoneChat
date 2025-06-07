import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";

// Sign up
const signup = async (req, res) => {
  const { fullName, email, pw, bio } = req.body;
  try {
    if (!fullName || !email || !pw || !bio) {
      return res.json({ success: false, message: "Missing details" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }
    const protein = await bcrypt.genSalt(5);
    const hashedPw = await bcrypt.hash(pw, protein);

    const newUser = await User.create({ fullName, email, pw: hashedPw, bio });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      userData: newUser,
      token,
      message: "created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, pw } = req.body;
  try {
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }
    const isPwCorrect = await bcrypt.compare(pw, userData.pw);
    if (!isPwCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(userData._id);
    res.json({
      success: true,
      userData,
      token,
      message: "login successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// check is authenticated
const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

//update profile
const updateProfile = async (req, res) => {
  try {
    const { img, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if (!img) {
      updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
    } else {
      const upload = await cloudinary.uploader.upload(img);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { img: upload.secure_url, bio, fullName },
        { new: true }
      );
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { checkAuth, login, signup, updateProfile };

