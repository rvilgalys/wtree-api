const express = require("express");
const router = express.Router();
const checkToken = require("../middleware/checkToken");
const GameManager = require("../../managers/gameManager");

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "game-get",
    facePick: "/game/facepick",
    facePickMattMode: "/game/facepick/mattmode",
    namePick: "/game/namepick",
    namePickMattMode: "/game/namepick/mattmode"
  });
});

router.get("/facepick", async (req, res, next) => {
  const gameInfo = await GameManager.facePickGame();
  res.status(200).json({
    message: "game-get",
    game: gameInfo
  });
});

router.get("/facepick/mattmode", async (req, res, next) => {
  const gameInfo = await GameManager.facePickGame(true);
  res.status(200).json({
    message: "game-get-facepick-mattmode",
    game: gameInfo
  });
});

router.get("/namepick", async (req, res, next) => {
  const gameInfo = await GameManager.namePickGame();
  res.status(200).json({
    message: "namepick",
    game: gameInfo
  });
});

router.get("/namepick/mattmode", async (req, res, next) => {
  const gameInfo = await GameManager.namePickGame(true);
  res.status(200).json({
    message: "namepick-mattmode",
    game: gameInfo
  });
});

router.post("/answer", checkToken, async (req, res, next) => {
  await GameManager.submitAnswer(req.userData, req.body);
  res.status(200).json({
    message: "game-post",
    data: req.userData
  });
});

module.exports = router;
