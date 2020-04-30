const express = require("express");
const app = express();
const PORT = 3000;
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

app.use(express.json()); //required if you use req.body
app.use(cookieParser("notagoodsecret"));

var corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));

const songRouter = require("./song.router.js");
const movieRouter = require("./movie.router.js");
const userRouter = require("./user.route");

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.use("/songs?", songRouter);
app.use("/movies?", movieRouter);
app.use("/users?", userRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500);
  res.json({ message: err.message });
});

module.exports = app;
