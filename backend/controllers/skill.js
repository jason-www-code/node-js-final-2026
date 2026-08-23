const { dataSource } = require("../db/data-source");
const { errorHandler } = require("../utils/errorHandler");
const { isValidString } = require("../utils/validUtils");

const skillRepository = dataSource.getRepository("Skills");
async function getSkills(request, response, next) {
  const skills = await skillRepository.find({
    select: { id: true, name: true },
  });

  return response.status(200).json({
    status: "success",
    data: skills,
  });
}
async function postSkill(request, response, next) {
  const { name } = request.body;

  if (!isValidString(name)) return next(errorHandler(400, "欄位未填寫正確"));

  const existSkill = await skillRepository.findOneBy({
    name: name.trim(),
  });

  if (existSkill) return next(errorHandler(409, "資料重複"));

  const newSkill = await skillRepository.save({
    name: name.trim(),
  });

  console.log(newSkill);
  return response.status(200).json({
    status: "success",
    data: newSkill,
  });
}

async function deleteSkill(request, response, next) {
  const { skillId } = request.params;

  const deleteResult = await skillRepository.delete(skillId);

  if (deleteResult.affected === 0) return next(errorHandler(400, "ID錯誤"));

  return response.status(200).json({
    status: "success",
    data: deleteResult,
  });
}

module.exports = { getSkills, postSkill, deleteSkill };
