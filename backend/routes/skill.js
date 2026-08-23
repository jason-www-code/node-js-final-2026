const router = require("express").Router();

const { getSkills, postSkill, deleteSkill } = require("../controllers/skill");

router.get("/", getSkills);
router.post("/", postSkill);
router.delete("/:skillId", deleteSkill);

module.exports = router;
