import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import messageRouter from "./routes/messageRoutes.js";
import userRouter from "./routes/userRoutes.js";
// create express app and http server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

//store online users
export const userSocketMap = {}; //{userId: socketId}

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Current online users:", Object.keys(userSocketMap));
  }

  //emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    if (userId) {
      delete userSocketMap[userId];
      console.log("Remaining online users:", Object.keys(userSocketMap));
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

(async () => {
  try {
    await connectDB();

    app.use("/api/status", (req, res) => res.send("Server is live"));

    //routes set up
    app.use("/api/auth", userRouter);
    app.use("/api/messages", messageRouter);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log("Server is running on: " + PORT);
      console.log("CORS enabled for all origins");
      console.log("MongoDB URI:", process.env.MONGODB_URI);
    });
  } catch (err) {
    console.error("Error during server startup:", err.message);
  }
})();
//export server for vercel
export default server;
