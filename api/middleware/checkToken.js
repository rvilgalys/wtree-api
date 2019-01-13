const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: `Invalid authorization provided -- expected a valid "Authorization: Bearer <token>" header for this path. Create a new user or login an existing one by POSTing to /users/:username`,
      documentation: process.env.DOCUMENTATION
    });
  }
  const token = req.headers.authorization.split(" ")[1]; // expected header convention: 'Bearer <token>'

  const decodedToken = await jwt.verify(token, process.env.JWT_KEY);
  if (!decodedToken) {
    return res.status(401).json({
      message: `Invalid authorization provided -- expected a valid "Authorization: Bearer <token>" header for this path. Create a new user or login an existing one by POSTing to /users/:username`,
      documentation: process.env.DOCUMENTATION
    });
  }
  req.userData = decodedToken; // if token is valid, we pass it on so our other routes can use it
  next();
};
