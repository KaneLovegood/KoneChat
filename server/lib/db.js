import mongoose from "mongoose";

//connect to mongodb
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("db connected"));
    mongoose.connection.on("error", (err) => console.log("db connection error:", err));
    mongoose.connection.on("disconnected", () => console.log("db disconnected"));

    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
