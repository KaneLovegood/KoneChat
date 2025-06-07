//get all users except the logged in user

import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
export const getUserForSideBar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-pw"
    );
    //count messages not seen
    const unseenMess = {};
    const promises = filteredUsers.map(async (user) => {
      const mess = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (mess.length > 0) {
        unseenMess[user._id] = mess.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMess });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get all mess for selected user
export const getMess = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const mess = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.json({ success: true, messages: mess });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//send mess

export const sendMess = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received params:", req.params);
    console.log("User from request:", req.user);

    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    console.log("Processing message:", { text, image, receiverId, senderId });

    let imgURL;
    if (image) {
      console.log("Uploading image to cloudinary...");
      const upload = await cloudinary.uploader.upload(image);
      imgURL = upload.secure_url;
      console.log("Image uploaded successfully:", imgURL);
    }

    console.log("Creating new message...");
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imgURL,
    });
    console.log("Message created:", newMessage);

    //emit new mess to receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      console.log("Emitting to socket:", receiverSocketId);
      io.to(receiverSocketId).emit("new_message", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("Error in sendMess:", error);
    res.json({ success: false, message: error.message });
  }
};
