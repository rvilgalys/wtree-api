const express = require("express");
const hostname = require("../hostname");

const router = express.Router();

const baseResponse = {
  // root of api -- only provide links to the rest of the tree
  message: "Welcome to the Willowtree Name Game-API, valid routes are below",
  documentation: process.env.DOCUMENTATION,
  users: `/users`,
  game: `/game`,
  people: `/people`,
  stats: `/stats`
};

router.get("/", (req, res, next) => {
  res.status(200).json(baseResponse);
});

module.exports = router;
