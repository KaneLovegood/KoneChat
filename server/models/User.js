import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    pw: { type: String, required: true},
    img: { type: String, default: "" },
    bio: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
