const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema({
  id: Number,
  name: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  artist: {
    type: String,
    required: true,
    minlength: 3,
  },
});

const SongDb = mongoose.model("SongDb", songSchema);
module.exports = SongDb;
