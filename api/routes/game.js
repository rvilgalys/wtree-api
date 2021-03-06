const express = require("express");
const router = express.Router();
const checkToken = require("../middleware/checkToken");
const GameManager = require("../../managers/gameManager");

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "game-types",
    facePick: "/game/facepick",
    facePickMattMode: "/game/facepick/mattmode",
    namePick: "/game/namepick",
    namePickMattMode: "/game/namepick/mattmode",
    answers: "/game/answer",
    clientInstructions:
      "Submit a GET request to any of the games to get the potential matches and an answer template. Fill in the template and POST it to /game/answers with valid user Auth Token."
  });
});

router.get("/facepick", async (req, res, next) => {
  try {
    const gameInfo = await GameManager.facePickGame();
    res.status(200).json({
      message: "facepick",
      game: gameInfo
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/facepick/mattmode", async (req, res, next) => {
  try {
    const gameInfo = await GameManager.facePickGame(true);
    res.status(200).json({
      message: "facepick-mattmode",
      game: gameInfo
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/namepick", async (req, res, next) => {
  try {
    const gameInfo = await GameManager.namePickGame();
    res.status(200).json({
      message: "namepick",
      game: gameInfo
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/namepick/mattmode", async (req, res, next) => {
  try {
    const gameInfo = await GameManager.namePickGame(true);
    res.status(200).json({
      message: "namepick-mattmode",
      game: gameInfo
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.post("/answer", checkToken, async (req, res, next) => {
  try {
    await GameManager.submitAnswer(req.userData, req.body).then(user => {
      res.status(200).json({
        message: "answer-post",
        data: req.userData,
        user
      });
    });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

module.exports = router;
