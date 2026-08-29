const jwt = require("jsonwebtoken");

const { getEnv } = require("../config");

const { errorHandler } = require("../utils/errorHandler");
const { dataSource } = require("../db/data-source");

const userRepository = dataSource.getRepository("Users");
async function isAuth(request, response, next) {
  const { authorization } = request.headers;

  if (!authorization || !authorization.startsWith("Bearer "))
    return next(errorHandler(401, "請先登入"));

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, getEnv("secret.jwtSecret"));

    const existUser = await userRepository.findOneBy({
      id: decodedToken.id,
    });

    if (!existUser) return next(errorHandler(401, "無效的 token"));

    request.user = existUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return next(errorHandler(401, "Token 已過期"));

    return next(errorHandler(401, "無效的 token"));
  }
}

module.exports = isAuth;
