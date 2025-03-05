import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./libs/connectDB.js";

const app = express();

app.use(cors(
  {
    origin: "http://localhost:5174", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies)
  }
));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true , limit:"10mb"}));
app.use(express.static("public"))
app.use(cookieParser());
app.use(morgan('dev'));

import authRoutes from "./routes/shipAuth.route.js"
import chatRoutes from "./routes/chat.route.js"


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});


const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  connectDB();
});