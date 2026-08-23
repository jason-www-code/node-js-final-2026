const router = require("express").Router();

const {
  getCreditPackages,
  postCreditPackage,
  deleteCreditPackage,
} = require("../controllers/credit-package");

router.get("/", getCreditPackages);
router.post("/", postCreditPackage);
router.delete("/:creditPackageId", deleteCreditPackage);

module.exports = router;
