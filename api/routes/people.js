const express = require("express");
const router = express.Router();
const PeopleManager = require("../../managers/peopleManager");

// this path is only being used to test the PeopleManager, it will be disabled in the production branch

router.get("/", async (req, res, next) => {
  const sixPeople = await PeopleManager.getRandomPersons(6);
  res.status(200).json({
    message: "people-get",
    people: sixPeople
  });
});

module.exports = router;
