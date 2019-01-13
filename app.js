const express = require("express");
const morgan = require("morgan");
const hostname = require("./api/hostname");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-czne4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    {
      useNewUrlParser: true
    }
  )
  .then(() =>
    console.log(`Database connection successful to ${process.env.MONGO_DB}`)
  )
  .catch(err => console.log(err));

const baseRoute = require("./api/routes/base");
const userRoutes = require("./api/routes/users");
const peopleRoutes = require("./api/routes/people");
const statsRoutes = require("./api/routes/stats");
const gameRoutes = require("./api/routes/game");

app.use(morgan("dev")); // morgan is logging middleware -- logs stuff and passes it forward
app.use(cors()); // enable cors for all origins
app.use(express.urlencoded({ extended: false })); // config to be able to take json in POST & other requests
app.use(express.json());

app.use("/", baseRoute);
app.use("/users", userRoutes);
app.use("/people", peopleRoutes);
app.use("/stats", statsRoutes);
app.use("/game", gameRoutes);

// throw a 404 for anything that doesn't route correctly, forward to next
app.use((req, res, next) => {
  const error = new Error("no valid route found");
  error.status = 404;
  next(error);
});

// final resting place for any errors
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      help: `try a GET request at the base entry point at ${hostname}`,
      documentation: process.env.DOCUMENTATION || null
    }
  });
});

module.exports = app;
