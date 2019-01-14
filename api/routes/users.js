const express = require("express");
const bcrypt = require("bcrypt");
const userManager = require("../../managers/userManager");
const router = express.Router();

router.get("/", async (req, res, next) => {
  await userManager
    .getUsers()
    .then(users => {
      res.status(200).json({
        message: "users-get",
        users
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    });
});

router.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    userManager.getUserByUsername(username).then(user => {
      res.status(200).json({
        message: `${username}'s info`,
        userStats: `/users/${username}/stats`,
        user: user
      });
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err.message
    });
  }
});

router.get("/:username/stats", async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await userManager.getUserStatsByUsername(username);

    res.status(200).json({
      message: `${username}'s stats`,
      user: user
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      error: err.message
    });
  }
});

router.post("/:username", async (req, res, next) => {
  const userName = req.params.username;
  const password = req.body.password;
  // we are allowing users to be created with no password as well -- they will be returned a JWT token to authenticate their session, but no way to log in again
  // we really *should* be using SSL if this was a production app, but as it is now the pw is sent cleartext  ¯\_(ツ)_/¯
  // (the reason i'm not doing this right now is that it's a hassle for chrome to always tell me the cert is self-signed, and I think the process take a couple days to get a new server validated when its deployed)

  const token = req.body.token;

  await userManager
    .submitUser({
      userName,
      password,
      token
    })
    .then(user => {
      res.status(200).json({
        message: "User validated!",
        username: user.userName,
        token: user.token,
        joined: user.joined
      });
    })
    .catch(err => {
      res.status(405).json({
        error: err.message
      });
    });
});

module.exports = router;
