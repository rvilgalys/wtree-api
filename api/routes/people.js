const express = require("express");
const router = express.Router();
const PeopleManager = require("../../managers/peopleManager");

// this path is only being used to test the PeopleManager, it would be disabled in the production branch
// i'm leaving it up right now in the demo, just to show part of the process

router.get("/", async (req, res, next) => {
  try {
    const sixPeople = await PeopleManager.getRandomPersons(6);
    res.status(200).json({
      message: "people-get",
      people: sixPeople
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
