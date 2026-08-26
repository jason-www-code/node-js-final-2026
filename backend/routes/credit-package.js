const router = require("express").Router();

const {
  getCreditPackages,
  postCreditPackage,
  deleteCreditPackage,
  purchaseCreditPackage,
} = require("../controllers/credit-package");
const isAuth = require("../middlewares/isAuth");

router.get("/", getCreditPackages);
router.post("/", postCreditPackage);
router.delete("/:creditPackageId", deleteCreditPackage);

router.post("/:creditPackageId", isAuth, purchaseCreditPackage);

module.exports = router;
