import express from "express";
import {
  getMess,
  getUserForSideBar,
  markMessageAsSeen,
  sendMess,
} from "../controller/messageController.js";
import { protectRoute } from "../middleware/auth.js";
const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSideBar);
messageRouter.get("/:id", protectRoute, getMess);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMess);

export default messageRouter;
