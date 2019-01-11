const prefix = process.env.PREFIX || "html"; // could be switched to https in deployment
const host = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 4000;

const hostname = `${prefix}://${host}:${port}`;

module.exports = hostname;
