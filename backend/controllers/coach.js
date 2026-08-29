const dayjs = require("dayjs");
const { MoreThan } = require("typeorm");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const {
  isValidString,
  isInteger,
  isValidUUID,
} = require("../utils/validUtils");

const coachRepository = dataSource.getRepository("Coach");
const coachLinkSkillRepository = dataSource.getRepository("CoachLinkSkill");
const courseRepository = dataSource.getRepository("Course");

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
  const { coachId } = request.params;

  if (!isValidString(coachId) || !isValidUUID(coachId))
    return next(errorHandler(400, "欄位未填寫正確"));

  const existCoach = await coachRepository.findOne({
    where: {
      id: coachId,
    },
  });
  if (!existCoach) return next(errorHandler(400, "找不到該教練"));

  const now = dayjs();

  const unfinishCourses = (
    await courseRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        user: {
          name: true,
        },
        skill: {
          name: true,
        },
      },
      where: {
        user_id: existCoach.user_id,
        end_at: MoreThan(now),
      },
      relations: {
        user: true,
        skill: true,
      },
      order: {
        start_at: "DESC",
      },
    })
  ).map((item) => {
    const obj = { ...item };
    const coach_name = obj.user.name;
    const skill_name = obj.skill.name;

    delete obj.user;
    delete obj.skill;

    return {
      ...obj,
      coach_name,
      skill_name,
    };
  });

  return response.status(200).json({
    status: "success",
    data: unfinishCourses,
  });
}

module.exports = {
  getCoachList,
  getCoachInfo,
  getProgressingCourses,
};
