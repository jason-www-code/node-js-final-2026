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

    console.log("decodedToken", decodedToken);

    const existUser = await userRepository.findOneBy({
      id: decodedToken.id,
    });

    if (!existUser) return next(errorHandler(401, "無效的 token"));

    request.user = existUser;
    next();
  } catch (error) {
    console.log("錯誤", error);
    console.log("錯誤名稱", error.name, error.message);
    if (error.name === "TokenExpiredError")
      return next(errorHandler(401, "Token 已過期"));

    return next(errorHandler(401, "無效的 token"));
  }
}

module.exports = isAuth;
