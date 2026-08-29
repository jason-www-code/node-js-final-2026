const router = require("express").Router();

const {
  getCourses,
  createBooking,
  deleteBooking,
} = require("../controllers/course");
const isAuth = require("../middlewares/isAuth");

router.get("/", getCourses);
router.post("/:courseId", isAuth, createBooking);
router.delete("/:courseId", isAuth, deleteBooking);

module.exports = router;
