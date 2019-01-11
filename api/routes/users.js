const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "users-get"
  });
});

router.get("/:username", (req, res, next) => {
  const username = req.params.username;
  // connect to userManager here

  res.status(200).json({
    message: `${username}'s info`
  });
});

router.post("/", (req, res, next) => {
  res.status(200).json({
    message: "users-post"
  });
});

module.exports = router;
