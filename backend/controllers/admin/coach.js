const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { dataSource } = require("../../db/data-source");
const { errorHandler } = require("../../utils/errorHandler");
const {
  isValidString,
  isValidPassword,
  isInteger,
} = require("../../utils/validUtils");
const { getEnv } = require("../../config");

const userRepository = dataSource.getRepository("Users");
const coachRepository = dataSource.getRepository("Coach");

async function upgradeToCoach(request, response, next) {
  const { userId } = request.params;
  const { experience_years, description, profile_image_url } = request.body;

  if (
    !isValidString(userId) ||
    !isInteger(experience_years) ||
    !isValidString(description) ||
    // profile_image_url 是選填欄位，只在有值的時候檢查
    // 沒有值 ( undefined ) 的時候不檢查
    (profile_image_url && !profile_image_url.startsWith("https"))
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const existUser = await userRepository.findOneBy({
    id: userId,
  });

  console.log("existUser", existUser);

  if (!existUser) return next(errorHandler(400, "使用者不存在"));

  if (existUser.role === "COACH")
    return next(errorHandler(409, "使用者已經是教練"));

  const updateCoach = await coachRepository.save({
    experience_years,
    description,
    profile_image_url,
    user_id: userId,

  });

  const updateUser = await userRepository.update(
    userId,
    {
      role: "COACH",
    },
    {
      returning: ["role", "user_id"], // 直接取得更新後的 role 欄位，不需要再 findOneBy()
    },
  );

  const [{ role }] = updateUser.raw;

  console.log("updateCoach", updateCoach, updateUser);

  return response.status(201).json({
    status: "success",
    data: {
      user: {
        name: existUser.name,
        role,
      },
      coach: updateCoach,
    },
  });
}

async function getCoach(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {
      text: true,
    },
  });
}
async function putCoach(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {
      text: true,
    },
  });
}

async function getCourses(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {
      text: true,
    },
  });
}

async function postCourse(request, response, next) {
  return response.status(201).json({
    status: "success",
    data: {
      text: true,
    },
  });
}

async function getCourseInfo(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {
      text: true,
    },
  });
}

async function putCourseInfo(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {
      text: true,
    },
  });
}

module.exports = {
  upgradeToCoach,
  getCoach,
  putCoach,
  getCourses,
  postCourse,
  getCourseInfo,
  putCourseInfo,
};
