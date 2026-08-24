const router = require("express").Router();

const {
  signup,
  login,
  getProfile,
  putProfile,
  putPassword,
} = require("../controllers/user");

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getProfile);
router.put("/profile", putProfile);
router.put("/password", putPassword);

module.exports = router;
