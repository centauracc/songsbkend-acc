const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");

const SongDb = require("./models/song.model");
const SongController = require("./songs.controller");

const requireJsonContent = (req, res, next) => {
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send("Server wants application/json");
  } else {
    next();
  }
};

// Start of song

router.get("/", SongController.findAll);

router.get("/:songId", SongController.findOne);

router.post("/", requireJsonContent, SongController.createOne);

router.put("/:songId", requireJsonContent, SongController.updateOne);

router.delete("/:songId", SongController.deleteOne);

// End of song

module.exports = router;
