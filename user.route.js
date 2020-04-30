const express = require("express");
const router = express.Router();
const User = require("./models/user.model");
const bcrypt = require("bcryptjs");
const { createJWTToken } = require("./utils/jwt");
const { protectRoute } = require("./middleware/auth");

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out");
});

router.post("/", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username: username });
    if (!foundUser) {
      const noUserError = new Error("User not found!");
      noUserError.statusCode = 404;
      throw noUserError;
    }

    const result = await bcrypt.compare(password, foundUser.password);
    if (!result) {
      const wrongPasswordError = new Error("Invalid password!");
      wrongPasswordError.statusCode = 404;
      throw wrongPasswordError;
    }

    const token = createJWTToken(username);
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    const secureFlag = true;

    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      res.cookie("token", token, {
        expires: expiryDate,
        httpOnly: true,
        signed: true,
      });
    } else {
      res.cookie("token", token, {
        expires: expiryDate,
        httpOnly: true, // client side js cannot access cookie info
        secure: true, // use HTTPS
        signed: true, // signed cookie
      });
    }
    res.send("You are now logged in!");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/:username", protectRoute, async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).lean();
    if (!user) {
      const noUserError = new Error("User does not exist");
      noUserError.statusCode = 404;
      throw noUserError;
    }
    if (req.user.username !== req.params.username) {
      const notAuthorisedToViewOthersError = new Error(
        "You are not authorised to view others"
      );
      notAuthorisedToViewOthersError.statusCode = 403;
      throw notAuthorisedToViewOthersError;
    }
    res.json({ username: user.username });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
