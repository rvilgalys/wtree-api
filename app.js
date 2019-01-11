const express = require("express");
const app = express();

const baseRoute = require("./api/routes/base");
const userRoutes = require("./api/routes/users");
const peopleRoutes = require("./api/routes/people");
const statsRoutes = require("./api/routes/stats");
const gameRoutes = require("./api/routes/game");

app.use("/", baseRoute);
app.use("/users", userRoutes);
app.use("/people", peopleRoutes);
app.use("/stats", statsRoutes);
app.use("/game", gameRoutes);

module.exports = app;
