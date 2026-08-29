const dayjs = require("dayjs");
const { In } = require("typeorm");

const { dataSource } = require("../../db/data-source");
const { errorHandler } = require("../../utils/errorHandler");
const { isValidString, isInteger } = require("../../utils/validUtils");

const userRepository = dataSource.getRepository("Users");
const coachRepository = dataSource.getRepository("Coach");
const coachLinkSkillRepository = dataSource.getRepository("CoachLinkSkill");
const skillRepository = dataSource.getRepository("Skills");
const courseRepository = dataSource.getRepository("Course");

async function upgradeToCoach(request, response, next) {
  const { userId } = request.params;
  const { experience_years, description, profile_image_url } = request.body;

  if (
    !isValidString(userId) ||
    !isInteger(experience_years) ||
    experience_years < 0 ||
    !isValidString(description) ||
    // profile_image_url 是選填欄位，只在有值的時候檢查
    // 沒有值 ( undefined ) 的時候不檢查
    (profile_image_url && !profile_image_url.startsWith("https"))
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const existUser = await userRepository.findOneBy({
    id: userId,
  });

  if (!existUser) return next(errorHandler(400, "使用者不存在"));

  const existCoach = await coachRepository.findOneBy({
    user_id: userId,
  });

  if (existCoach) return next(errorHandler(409, "使用者已經是教練"));

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
      returning: ["role"], // 直接取得更新後的 role 欄位，不需要再 findOneBy()
    },
  );

  const [{ role }] = updateUser.raw;

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
  const coach = await coachRepository.findOne({
    select: {
      id: true,
      experience_years: true,
      description: true,
      profile_image_url: true,
    },
    where: {
      user_id: request.user.id,
    },
  });

  //找出跟教練綁定的技能
  const coachBindingSkills = (
    await coachLinkSkillRepository.find({
      select: {
        skill_id: true,
      },
      where: {
        coach_id: coach.id,
      },
    })
  ).map((item) => item.skill_id);

  return response.status(200).json({
    status: "success",
    data: {
      ...coach,

      // sklii_link_coach
      skill_ids: coachBindingSkills,
    },
  });
}
async function putCoach(request, response, next) {
  const { experience_years, description, profile_image_url, skill_ids } =
    request.body;

  // 檢查每一個 skill_ids 在 skills 資料表是否存在
  const existSkills = await skillRepository.find({
    where: {
      id: In(skill_ids),
    },
  });

  if (
    !isInteger(experience_years) ||
    experience_years < 0 ||
    !isValidString(description) ||
    !isValidString(profile_image_url) ||
    !profile_image_url.startsWith("https") ||
    !skill_ids ||
    !Array.isArray(skill_ids) ||
    skill_ids.length === 0 ||
    existSkills.length !== skill_ids.length
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  // 用  request.user 去 COACH 表找出 Coach.id  ( 此時 role = 'COACH' )

  const { id } = await coachRepository.findOneBy({
    user_id: request.user.id,
  });

  // update COACH 表的時候傳入 id 去改 experience_years description profile_image_url

  const updateResult = await coachRepository.update(
    id,
    {
      experience_years,
      description,
      profile_image_url,
    },
    {
      returning: ["id", "experience_years", "description", "profile_image_url"],
    },
  );

  await coachLinkSkillRepository.delete({ coach_id: id });

  // 用 Coach.id save 多筆 skill_ids

  const obj = skill_ids.map((skilId) => ({ skill_id: skilId, coach_id: id }));

  const saveSkills = (await coachLinkSkillRepository.save(obj)).map(
    (item) => item.skill_id,
  );

  return response.status(200).json({
    status: "success",
    data: {
      ...updateResult.raw[0],
      skill_ids: saveSkills,
    },
  });
}

async function getCourses(request, response, next) {
  const courses = (
    await courseRepository.find({
      select: {
        id: true,
        name: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        meeting_url: true,
      },
      where: {
        user_id: request.user.id,
      },
    })
  ).map((course) => {
    // 計算時間 status
    const now = dayjs();

    const status = now.isBefore(course.start_at)
      ? "尚未開始"
      : now.isAfter(course.end_at)
        ? "已結束"
        : "進行中";

    // participants 課程「未取消」的報名數——已取消的報名不計
    const participants = 0;

    return {
      ...course,
      status,
      participants,
    };
  });

  return response.status(200).json({
    status: "success",
    data: courses,
  });
}

async function postCourse(request, response, next) {
  const {
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  } = request.body;

  if (
    !isValidString(skill_id) ||
    !isValidString(name) ||
    !isValidString(description) ||
    !isValidString(start_at) ||
    !isValidString(end_at) ||
    !isValidString(meeting_url) ||
    !isInteger(max_participants) ||
    max_participants < 0 ||
    !meeting_url.startsWith("https")
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const newCourse = await courseRepository.save({
    user_id: request.user.id,
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  });

  return response.status(201).json({
    status: "success",
    data: {
      course: newCourse,
    },
  });
}

async function getCourseInfo(request, response, next) {
  const { courseId } = request.params;

  const existCourse = await courseRepository.findOne({
    select: {
      id: true,
      name: true,
      description: true,
      start_at: true,
      end_at: true,
      max_participants: true,
      skill_id: true,
      meeting_url: true,
    },
    where: {
      id: courseId,
      user_id: request.user.id,
    },
  });

  if (!existCourse) return next(errorHandler(400, "課程不存在"));

  const { name: skill_name } = await skillRepository.findOne({
    select: {
      name: true,
    },
    where: {
      id: existCourse.skill_id,
    },
  });

  return response.status(200).json({
    status: "success",
    data: {
      ...existCourse,
      skill_name,
    },
  });
}

async function putCourseInfo(request, response, next) {
  const { courseId } = request.params;
  const {
    skill_id,
    name,
    description,
    start_at,
    end_at,
    max_participants,
    meeting_url,
  } = request.body;

  if (
    !isValidString(skill_id) ||
    !isValidString(name) ||
    !isValidString(description) ||
    !isValidString(start_at) ||
    !isValidString(end_at) ||
    !isValidString(meeting_url) ||
    !isInteger(max_participants) ||
    max_participants < 0 ||
    !meeting_url.startsWith("https")
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const existCourse = await courseRepository.findOne({
    select: {
      id: true,
      name: true,
      description: true,
      start_at: true,
      end_at: true,
      max_participants: true,
      skill_id: true,
      meeting_url: true,
    },
    where: {
      id: courseId,
      user_id: request.user.id,
    },
  });

  if (!existCourse) return next(errorHandler(400, "課程不存在"));

  const updateCourse = await courseRepository.update(
    courseId,
    {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    },
    {
      returning: [
        "id",
        "user_id",
        "skill_id",
        "name",
        "description",
        "start_at",
        "end_at",
        "max_participants",
        "meeting_url",
        "created_at",
        "updated_at",
      ],
    },
  );

  return response.status(200).json({
    status: "success",
    data: {
      course: updateCourse.raw[0],
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
