const express = require("express");
const cors = require("cors");

const { errorHandler } = require("./utils/errorHandler");

const skillRoute = require("./routes/skill");
const creditRoute = require("./routes/credit-package");
const userRoute = require("./routes/user");
const coachRoute = require("./routes/admin/coach");
const publicCoachRoute = require("./routes/coach");
const courseRoute = require("./routes/course");

const app = express();

app.use(cors());
app.use(express.json());

// M0 healthcheck（下一步實作）
app.get("/healthcheck", (_, response) => response.status(200).send("OK!"));

// 路由掛載（後續步驟逐一加入）
app.use("/api/coaches/skill", skillRoute);
app.use("/api/credit-package", creditRoute);
app.use("/api/users", userRoute);
app.use("/api/admin/coaches", coachRoute);
app.use("/api/coaches", publicCoachRoute);
app.use("/api/courses", courseRoute);

// 最後記得回去改 coachRoute > getCourses  的  participants 欄位，要扣掉 已取消的報名

//TODO : M3 M4 都加入 uuid 格式的驗證

// 404 錯誤
app.use((_, __, next) => next(errorHandler(404, "找不到無此路由 !!!")));

// 全域錯誤處理
app.use((error, _, response, next) => {
  const statusCode = error.statusCode || 500;

  return response.status(statusCode).json({
    status: statusCode === 500 ? "error" : "failed",
    message: error.message || "伺服器錯誤",
  });
});

module.exports = app;
