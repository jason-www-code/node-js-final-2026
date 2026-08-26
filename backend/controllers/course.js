const dayjs = require("dayjs");
const { LessThanOrEqual, MoreThan } = require("typeorm");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const {
  isValidString,
  isValidPassword,
  isInteger,
} = require("../utils/validUtils");

const userRepository = dataSource.getRepository("Users");
const coachRepository = dataSource.getRepository("Coach");
const courseRepository = dataSource.getRepository("Course");

async function getCourses(request, response, next) {
  const now = dayjs();

  const progressingCourses = (
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
        start_at: LessThanOrEqual(now),
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
    data: progressingCourses,
  });
}

module.exports = {
  getCourses,
};
