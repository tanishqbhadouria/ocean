import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./libs/connectDB.js";

const app = express();

app.use(cors(
  {
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies)
  }
));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true , limit:"10mb"}));
app.use(express.static("public"))
app.use(cookieParser());
app.use(morgan('dev'));

import authRoutes from "./routes/shipAuth.route.js"


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

<<<<<<< HEAD

const port = process.env.PORT || 3001;
=======
// routes decalaration   here mounting the specific routers to the app , this each router's will use Router.use('path',(rq,res));
// app.use("/api/v1/auth", authRouter);

// app.use("/api/v1/posts", postsRouter);


// app.use("/api/v1/comment", commentRouter);

// app.use("/api/v1/conversation", conversationRouter);

// app.use("/api/v1/message", messageRouter);

// app.use("/api/v1/post-interaction", postInteractionRouter);

// app.use("/api/v1/links", linkRouter);

// const port = process.env.PORT || 3001;
>>>>>>> 2322df7beae04d1942b2d503b5e061afc3c452d4

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  connectDB();
});