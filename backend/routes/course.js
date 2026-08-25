const router = require("express").Router();

const {
getCourses
} = require("../controllers/course");


router.get("/",getCourses);

module.exports = router;
