const http = require("http"); // not using SSL for now since it generates warnings for self-signed certs
const app = require("./app");

const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(port);
