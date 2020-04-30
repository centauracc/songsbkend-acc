const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema({
  id: Number,
  movieName: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
});

const MovieDb = mongoose.model("MovieDb", movieSchema);
module.exports = MovieDb;
