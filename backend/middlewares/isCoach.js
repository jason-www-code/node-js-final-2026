const { errorHandler } = require("../utils/errorHandler");

function isCoach(req, res, next) {
  if (!req.user || req.user.role !== "COACH")
    return next(errorHandler(401, "使用者尚未成為教練"));

  next();
}
module.exports = isCoach;
