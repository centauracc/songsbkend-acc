const mongoose = require("mongodb-memory-server");

module.exports = async () => {
  await global.__MONGOSERVER__.stop();
};
