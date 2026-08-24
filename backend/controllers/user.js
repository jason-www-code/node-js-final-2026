const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const { isValidString } = require("../utils/validUtils");

const userRepository = dataSource.getRepository("Users");
async function signup(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: "signup",
  });
}

async function login(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: "login",
  });
}

async function getProfile(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: "getProfile",
  });
}
async function putProfile(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: "putProfile",
  });
}

async function putPassword(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: "putPassword",
  });
}

module.exports = { signup, login, getProfile, putProfile, putPassword };
