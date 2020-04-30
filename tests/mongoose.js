const mongoose = require("mongoose");

const teardownMongoose = async () => {
  await mongoose.disconnect();
};

module.exports = teardownMongoose;
