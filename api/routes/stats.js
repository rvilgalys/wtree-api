const express = require("express");
const router = express.Router();
const StatManager = require("../../managers/statManager");

router.get("/", (req, res, next) => {
  try {
    StatManager.getLeaderboard().then(leaderboard => {
      res.status(200).json({
        message: "leaderboard",
        leaderboard: leaderboard.map(entry => {
          return {
            _id: entry._id,
            user: `/users/${entry.userName}`,
            stats: entry.stats
          };
        })
      });
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
});

module.exports = router;
