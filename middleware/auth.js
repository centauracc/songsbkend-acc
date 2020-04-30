const jwt = require("jsonwebtoken");
const { getSecret } = require("../utils/jwt");

const protectRoute = (req, res, next) => {
  const cookieName = "token";
  const token = req.signedCookies[cookieName];

  if (!token) {
    const notAuthorisedError = new Error("You are not authorised!");
    notAuthorisedError.statusCode = 401;
    throw notAuthorisedError;
  }

  try {
    req.user = jwt.verify(token, getSecret()); // decoded token
  } catch (err) {
    const notAuthorisedError = new Error("You are not authorised!");
    notAuthorisedError.statusCode = 401;
    throw notAuthorisedError;
  }

  next();
};

module.exports = { protectRoute };
