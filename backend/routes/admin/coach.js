const router = require("express").Router();

const {
  upgradeToCoach,
  getCoach,
  putCoach,
  getCourses,
  postCourse,
  getCourseInfo,
  putCourseInfo,
} = require("../../controllers/admin/coach");
const isAuth = require("../../middlewares/isAuth");

router.post("/:userId", upgradeToCoach);
router.get("/", isAuth, getCoach);
router.put("/", isAuth, putCoach);
router.get("/courses", isAuth, getCourses);
router.post("/courses", isAuth, postCourse);
router.get("/courses/:courseId", isAuth, getCourseInfo);
router.put("/courses/:courseId", isAuth, putCourseInfo);

module.exports = router;
