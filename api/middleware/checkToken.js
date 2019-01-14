const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error(
        `Invalid authorization provided -- expected a valid "Authorization: Bearer <token>" header for this path. Create a new user or login an existing one by POSTing to /users/:username`
      );
    }
    const token = req.headers.authorization.split(" ")[1]; // expected header convention: 'Bearer <token>'

    const decodedToken = await jwt.verify(token, process.env.JWT_KEY);
    if (!decodedToken) {
      throw new Error(
        `Invalid authorization provided -- expected a valid "Authorization: Bearer <token>" header for this path. Create a new user or login an existing one by POSTing to /users/:username`
      );
    }
    req.userData = decodedToken; // if token is valid, we pass it on so our other routes can use it
    next();
  } catch (err) {
    return res.status(401).json({
      error: err.message,
      documentation: process.env.DOCUMENTATION
    });
  }
};
