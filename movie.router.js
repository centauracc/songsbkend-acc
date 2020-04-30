const express = require("express");
const router = express.Router();

const movieData = [];
let movieId = 1;

const requireJsonContent = (req, res, next) => {
  if (req.headers["content-type"] !== "application/json") {
    res.status(400).send("Server wants application/json");
  } else {
    next();
  }
};

// Start of movie

router.get("/", (req, res) => {
  res.json(movieData);
});

router.get("/:movieId", (req, res) => {
  const requestedMovie = movieData.filter((aMovie) => {
    return req.params.movieId === String(aMovie.id);
  });

  res.json(requestedMovie);
});

router.post("/", requireJsonContent, (req, res) => {
  const newMovie = {
    id: movieId,
    movieName: req.body.movieName,
  };

  movieData.push(newMovie);
  movieId++;

  res.status(201).json(newMovie);
});

router.put("/:movieId", (req, res) => {
  let movieFound = false;

  movieData.forEach((aMovie) => {
    if (String(aMovie.id) === req.params.movieId) {
      aMovie.movieName = req.body.movieName;
      movieFound = true;
    }
  });

  if (movieFound) {
    res.json({
      id: req.params.movieId,
      name: req.body.movieName,
    });
  } else {
    res.status(404).send("Movie is not found");
  }
});

router.delete("/:movieId", (req, res) => {
  const movieIndexToDelete = movieData.findIndex(
    (aMovie) => String(aMovie.id) === req.params.movieId
  );

  const deletedMovie = movieData.splice(movieIndexToDelete, 1);

  if (movieIndexToDelete !== -1) {
    res.json(deletedMovie[0]);
  } else {
    res.status(404).send("Movie is not found");
  }
});

// End of movie

module.exports = router;
