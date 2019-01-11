const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "game-get"
  });
});

router.post("/", (req, res, next) => {
  res.status(200).json({
    message: "game-post"
  });
});

module.exports = router;
