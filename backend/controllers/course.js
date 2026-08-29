const dayjs = require("dayjs");
const { LessThanOrEqual, MoreThan, IsNull } = require("typeorm");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const { isValidUUID } = require("../utils/validUtils");

const courseRepository = dataSource.getRepository("Course");
const bookingRepository = dataSource.getRepository("CourseBooking");
const purchaseRepository = dataSource.getRepository("CreditPurchase");


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

async function createBooking(request, response, next) {
  const { courseId } = request.params;
  const { id } = request.user;

  if (!isValidUUID(courseId)) return next(errorHandler(400, "ID錯誤"));

  const existCourse = await courseRepository.findOneBy({
    id: courseId,
  });

  if (!existCourse) return next(errorHandler(400, "ID錯誤"));

  const existBooking = await bookingRepository.findOneBy({
    course_id: courseId,
    user_id: id,
  });

  if (existBooking) return next(errorHandler(400, "已經報名過此課程"));

  const credits = (
    await purchaseRepository.find({
      where: {
        user_id: id,
      },
    })
  ).reduce((acc, record) => acc + record.purchased_credits, 0);

  const creditUsage = await bookingRepository.count({
    where: {
      cancelled_at: IsNull(),
      user_id: id,
    },
  });

  if (credits - creditUsage <= 0)
    return next(errorHandler(400, "已無可使用堂數"));

  const bookingParticipants = await bookingRepository.count({
    where: {
      course_id: courseId,
    },
  });

  if (bookingParticipants >= existCourse.max_participants)
    return next(errorHandler(400, "已達最大參加人數，無法參加"));

  await bookingRepository.save({
    user_id: id,
    course_id: courseId,
  });

  return response.status(201).json({
    status: "success",
    data: null,
  });
}

async function deleteBooking(request, response, next) {
  console.log('deleteBooking');
  
  const { courseId } = request.params;
  const { id } = request.user;

  if (!isValidUUID(courseId)) return next(errorHandler(400, "ID錯誤"));

  const existBooking = await bookingRepository.findOneBy({
    user_id: id,
    course_id: courseId,
    cancelled_at: IsNull(),
  });

  if (!existBooking) return next(errorHandler(400, "ID錯誤"));

  const now = dayjs();

  await bookingRepository.update(existBooking.id, {
    cancelled_at: now,
  });


  console.log(now)

  return response.status(201).json({
    status: "success",
    data: null,
  });
}

module.exports = {
  getCourses,
  createBooking,
  deleteBooking,
};
