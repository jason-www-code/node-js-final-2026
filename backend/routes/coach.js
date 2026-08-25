const router = require("express").Router();

const {
  getCoachList,
  getCoachInfo,
  getProgressingCourses,
} = require("../controllers/coach");

router.get("/", getCoachList);
router.get("/:coachId", getCoachInfo);
router.get("/:coachId/courses", getProgressingCourses);

module.exports = router;
