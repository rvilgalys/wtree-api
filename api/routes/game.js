const express = require("express");
const router = express.Router();
const checkToken = require("../middleware/checkToken");

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "game-get"
  });
});

router.post("/", checkToken, (req, res, next) => {
  res.status(200).json({
    message: "game-post",
    data: req.userData
  });
});

module.exports = router;
