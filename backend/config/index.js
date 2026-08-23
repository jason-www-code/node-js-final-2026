require("dotenv").config();

const db = require("./db");
const secret = require("./secret");
const web = require("./web");

const config = {
  db,
  web,
  secret,
};

function getEnv(path) {
  const [key, value] = path.split(".");

  return config[key][value];
}

module.exports = {
  getEnv,
};
