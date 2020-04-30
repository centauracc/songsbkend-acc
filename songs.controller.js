const SongDb = require("./models/song.model");
const Joi = require("@hapi/joi");

const validateSong = (song) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    artist: Joi.string().min(3).max(30).required(),
  });
  return schema.validate(song);
};

const findAll = async (req, res) => {
  let allSongDocuments;
  try {
    allSongDocuments = await SongDb.find();
  } catch (error) {
    console.error(error);
  }
  res.json(allSongDocuments);
};

const findOne = async (req, res) => {
  let requestedSong;
  try {
    requestedSong = await SongDb.findOne({ id: parseInt(req.params.songId) });
  } catch (error) {
    console.error(error);
  }
  res.json(requestedSong);
};

const createOne = async (req, res, next) => {
  const validation = validateSong(req.body);

  if (validation.error) {
    const error = new Error(validation.error.details[0].message);
    res.status(400).send(error);
  } else {
    let songWithMaxId;
    try {
      songWithMaxId = await SongDb.find().sort({ id: -1 }).limit(1);
    } catch (error) {
      console.error(error);
    }

    const newSong = {
      id: ++songWithMaxId[0].id,
      name: req.body.name,
      artist: req.body.artist,
    };
    newSongDocument = new SongDb(newSong);
    try {
      await newSongDocument.save();
    } catch (error) {
      console.error(error);
    }
    res.status(201).json(newSong);
  }
};

const updateOne = async (req, res) => {
  let theSongToUpdate;
  try {
    theSongToUpdate = await SongDb.findOneAndUpdate(
      { id: req.params.songId },
      { name: req.body.name, artist: req.body.artist },
      { new: true }
    );
  } catch (error) {
    console.error(error);
  }
  res.json(theSongToUpdate);
};

const deleteOne = async (req, res) => {
  let theSongToDelete;
  try {
    theSongToDelete = await SongDb.findOneAndDelete({ id: req.params.songId });
  } catch (error) {
    console.error(error);
  }
  res.json(theSongToDelete);
};

module.exports = { findAll, findOne, createOne, updateOne, deleteOne };
