const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const {
  isValidString,
  isInteger,
  isValidUUID,
} = require("../utils/validUtils");
const { getEnv } = require("../config");
const { In } = require("typeorm");

const userRepository = dataSource.getRepository("Users");
const coachRepository = dataSource.getRepository("Coach");
const coachLinkSkillRepository = dataSource.getRepository("CoachLinkSkill");
// const skillRepository = dataSource.getRepository("Skills");
// const courseRepository = dataSource.getRepository("Course");

async function getCoachList(request, response, next) {
  const { per, page } = request.query;

  if (
    !isValidString(per) ||
    !isValidString(page) ||
    !isInteger(Number(per)) ||
    !isInteger(Number(page)) ||
    Number(per) < 1 ||
    Number(page) < 1
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const offset = (page - 1) * per;

  const coaches = (
    await coachRepository.find({
      relations: {
        user: true,
      },
      select: {
        id: true,
        user_id: true,
        user: {
          name: true,
        },
        created_at: true, // 為了 orderby 必需保留
      },
      order: { created_at: "DESC" },
      take: per,
      skip: offset,
    })
  ).map((coach) => ({
    id: coach.id,
    user_id: coach.user_id,
    name: coach.user.name,
  }));

  return response.status(200).json({
    status: "success",
    data: coaches,
  });
}

async function getCoachInfo(request, response, next) {
  const { coachId } = request.params;

  if (!isValidString(coachId) || !isValidUUID(coachId))
    return next(errorHandler(400, "欄位未填寫正確"));

  const existCoach = await coachRepository.findOne({
    select: {
      user: {
        name: true,
        role: true,
      },
    },
    where: {
      id: coachId,
    },
    relations: {
      user: true,
    },
  });

  if (!existCoach) return next(errorHandler(400, "找不到該教練"));
  
  const user = existCoach.user;
  delete existCoach.user;
  
  console.log("existCoach", user, existCoach);


  // 找出該教練的所有技能
  const skills = (
    await coachLinkSkillRepository.find({
      select: {
        skill: {
          name: true,
        },
      },
      where: {
        coach_id: existCoach.id,
      },
      relations: {
        skill: true,
      },
    })
  ).map((item) => item.skill.name);

  return response.status(200).json({
    status: "success",
    data: {
      user,
      coach: {
        ...existCoach,
        skills,
      },
    },
  });
}
async function getProgressingCourses(request, response, next) {
  return response.status(200).json({
    status: "success",
    data: {},
  });
}

module.exports = {
  getCoachList,
  getCoachInfo,
  getProgressingCourses,
};
