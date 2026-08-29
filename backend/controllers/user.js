const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const { isValidString, isValidPassword } = require("../utils/validUtils");
const { getEnv } = require("../config");

const userRepository = dataSource.getRepository("Users");
const purchaseRepository = dataSource.getRepository("CreditPurchase");
const bookingRepository = dataSource.getRepository("CourseBooking");

async function signup(request, response, next) {
  const { name, email, password } = request.body;

  if (!isValidString(name) || !isValidString(email) || !isValidString(password))
    return next(errorHandler(400, "欄位未填寫正確"));

  if (!isValidPassword(password))
    return next(
      errorHandler(
        400,
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      ),
    );

  const existUser = await userRepository.findOneBy({
    email: email.trim().toLowerCase(),
  });

  if (existUser) return next(errorHandler(409, "Email 已被使用"));

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  // role 欄位因為在資料表預設是 "USER" ，所以不寫
  const newUser = await userRepository.save({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
  });

  return response.status(201).json({
    status: "success",
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
      },
    },
  });
}

async function login(request, response, next) {
  const { email, password } = request.body;

  if (!isValidString(email) || !isValidString(password))
    return next(errorHandler(400, "欄位未填寫正確"));

  if (!isValidPassword(password))
    return next(
      errorHandler(
        400,
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      ),
    );

  const existUser = await userRepository.findOneBy({
    email: email.trim().toLowerCase(),
  });

  if (!existUser) return next(errorHandler(409, "使用者不存在或密碼輸入錯誤"));

  const isPassWordMatch = await bcrypt.compare(password, existUser.password);

  if (!isPassWordMatch)
    return next(errorHandler(409, "使用者不存在或密碼輸入錯誤"));

  const token = jwt.sign(
    {
      id: existUser.id,
      role: existUser.role,
    },
    getEnv("secret.jwtSecret"),
    {
      expiresIn: getEnv("secret.jwtExpiresDay"),
    },
  );

  return response.status(201).json({
    status: "success",
    data: {
      token,
      user: {
        name: existUser.name,
      },
    },
  });
}

async function getProfile(request, response, next) {
  const { name, email } = request.user;

  return response.status(200).json({
    status: "success",
    data: {
      user: {
        name,
        email,
      },
    },
  });
}
async function putProfile(request, response, next) {
  const { name } = request.body;

  try {
    if (!isValidString(name)) return next(errorHandler(400, "欄位未填寫正確"));

    if (name === request.user.name)
      return next(errorHandler(400, "使用者名稱未變更"));

    const result = await userRepository.update(
      request.user.id, // 自動對應到  WHERE id
      {
        name: name.trim(), // 要更新的欄位
      },
    );

    return response.status(200).json({
      status: "success",
      data: {
        user: {
          name,
        },
      },
    });
  } catch (error) {
    next(errorHandler(400, "更新使用者資料失敗"));
  }
}

async function putPassword(request, response, next) {
  const { password, new_password, confirm_new_password } = request.body;

  if (
    !isValidString(password) ||
    !isValidString(new_password) ||
    !isValidString(confirm_new_password)
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  if (
    !isValidPassword(password) ||
    !isValidPassword(new_password) ||
    !isValidPassword(confirm_new_password)
  )
    return next(
      errorHandler(
        400,
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      ),
    );

  if (password === new_password)
    return next(errorHandler(400, "新密碼不能與舊密碼相同"));

  if (new_password !== confirm_new_password)
    return next(errorHandler(400, "新密碼與驗證新密碼不一致"));

  const isMatch = await bcrypt.compare(password, request.user.password);

  if (!isMatch) return next(errorHandler(400, "密碼輸入錯誤"));

  const hashedPassword = await bcrypt.hash(new_password.trim(), 10);

  await userRepository.update(request.user.id, {
    password: hashedPassword,
  });

  return response.status(200).json({
    status: "success",
    data: null,
  });
}

async function getCreditPackage(request, response, next) {
  const purchaseRecords = await purchaseRepository.find({
    select: {
      name: true,
      purchased_credits: true,
      price_paid: true,
      purchase_at: true,
    },
    where: { user_id: request.user.id },
    order: { purchase_at: "DESC" },
  });

  return response
    .status(200)
    .json({ status: "success", data: purchaseRecords });
}

async function getCourses(request, response, next) {
  const { id } = request.user;

  const courseBooking = (
    await bookingRepository.find({
      where: {
        user_id: id,
      },
      relations: {
        course: {
          user: true,
        },
      },
    })
  ).map((booking) => ({
    course_id: booking.course_id,
    name: booking.course.name,
    start_at: booking.course.start_at,
    end_at: booking.course.end_at,
    meeting_url: booking.course.meeting_url,
    coach_name: booking.course.user.name,
    cancelled_at: booking.cancelled_at,
  }));

  const credits = (
    await purchaseRepository.find({
      where: {
        user_id: id,
      },
    })
  ).reduce((acc, record) => acc + record.purchased_credits, 0);

  const creditUsage = courseBooking.filter(
    (booking) => booking.cancelled_at === null,
  ).length;

  const creditRemain = credits - creditUsage;

  return response.status(200).json({
    status: "success",
    data: {
      credit_remain: creditRemain,
      credit_usage: creditUsage,
      course_booking: courseBooking,
    },
  });
}

module.exports = {
  signup,
  login,
  getProfile,
  putProfile,
  putPassword,
  getCreditPackage,
  getCourses,
};
