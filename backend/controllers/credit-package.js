const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const {
  isValidString,
  isInteger,
  isValidUUID,
} = require("../utils/validUtils");

const creditPackageRepository = dataSource.getRepository("CreditPackage");
const purchaseRepository = dataSource.getRepository("CreditPurchase");
async function getCreditPackages(request, response, next) {
  const packages = await creditPackageRepository.find({
    select: { id: true, name: true, credit_amount: true, price: true },
  });

  return response.status(200).json({
    status: "success",
    data: packages,
  });
}
async function postCreditPackage(request, response, next) {
  const { name, credit_amount, price } = request.body;

  if (
    !isValidString(name) ||
    !isInteger(credit_amount) ||
    !isInteger(price) ||
    credit_amount < 0 ||
    price < 0
  )
    return next(errorHandler(400, "欄位未填寫正確"));

  const existPackage = await creditPackageRepository.findOneBy({
    name: name.trim(),
  });

  if (existPackage) return next(errorHandler(409, "資料重複"));

  const newtPackage = await creditPackageRepository.save({
    name: name.trim(),
    credit_amount,
    price,
  });

  return response.status(200).json({
    status: "success",
    data: newtPackage,
  });
}

async function deleteCreditPackage(request, response, next) {
  const { creditPackageId } = request.params;

  const deleteResult = await creditPackageRepository.delete(creditPackageId);

  if (deleteResult.affected === 0) return next(errorHandler(400, "ID錯誤"));

  return response.status(200).json({
    status: "success",
    data: deleteResult,
  });
}

async function purchaseCreditPackage(request, response, next) {
  const { creditPackageId } = request.params;

  if (!isValidUUID(creditPackageId)) return next(errorHandler(400, "ID錯誤"));

  const existpackage = await creditPackageRepository.findOneBy({
    id: creditPackageId,
  });
  
  if (!existpackage) return next(errorHandler(400, "ID錯誤"));

  await purchaseRepository.save({
    user_id: request.user.id,
    credit_package_id: existpackage.id,
    name: existpackage.name,
    purchased_credits: existpackage.credit_amount,
    price_paid: existpackage.price,
  });

  return response.status(200).json({
    status: "success",
    data: null,
  });
}

module.exports = {
  getCreditPackages,
  postCreditPackage,
  deleteCreditPackage,
  purchaseCreditPackage,
};
