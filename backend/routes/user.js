const router = require("express").Router();

const {
  signup,
  login,
  getProfile,
  putProfile,
  putPassword,
  getCreditPackage,
} = require("../controllers/user");
const isAuth = require("../middlewares/isAuth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", isAuth, getProfile);
router.put("/profile", isAuth, putProfile);
router.put("/password", isAuth, putPassword);

router.get("/credit-package", isAuth, getCreditPackage);

module.exports = router;
