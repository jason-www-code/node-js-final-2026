const router = require("express").Router();

const {
  signup,
  login,
  getProfile,
  putProfile,
  putPassword,
} = require("../controllers/user");
const isAuth = require("../middlewares/isAuth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", isAuth, getProfile);
router.put("/profile", isAuth, putProfile);
router.put("/password", isAuth, putPassword);

module.exports = router;
