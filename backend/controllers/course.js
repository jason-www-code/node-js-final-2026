const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const {
  isValidString,
  isValidPassword,
  isInteger,
} = require("../utils/validUtils");
const { getEnv } = require("../config");
const { In } = require("typeorm");

const userRepository = dataSource.getRepository("Users");
const coachRepository = dataSource.getRepository("Coach");
// const coachLinkSkillRepository = dataSource.getRepository("CoachLinkSkill");
// const skillRepository = dataSource.getRepository("Skills");
// const courseRepository = dataSource.getRepository("Course");

async function getCourses(request, response, next) {
  console.log("getCourses", request.user);

  return response.status(200).json({
    status: "success",
    data: {},
  });
}

module.exports = {
  getCourses,
};
