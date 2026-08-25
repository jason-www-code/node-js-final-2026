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
const isCoach = require("../../middlewares/isCoach");


router.get("/", isAuth, isCoach, getCoach);
router.put("/", isAuth, isCoach, putCoach);
router.get("/courses", isAuth, isCoach, getCourses);
router.post("/courses", isAuth, isCoach, postCourse);
router.get("/courses/:courseId", isAuth, getCourseInfo);
router.put("/courses/:courseId", isAuth, putCourseInfo);

router.post("/:userId", upgradeToCoach);
module.exports = router;
