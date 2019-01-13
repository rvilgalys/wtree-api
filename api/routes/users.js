const express = require("express");
const bcrypt = require("bcrypt");
const userManager = require("../../managers/userManager");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const users = await userManager.getUsers();
  res.status(200).json({
    message: "users-get",
    users
  });
});

router.get("/:username", (req, res, next) => {
  const username = req.params.username;
  // connect to userManager here

  res.status(200).json({
    message: `${username}'s info`
  });
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
