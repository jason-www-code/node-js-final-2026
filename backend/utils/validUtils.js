// utils/validUtils.js — 驗證工具函式
const isValidString = (value) =>
  typeof value === "string" && value.trim() !== "";

const isInteger = (value) =>
  typeof value === "number" && Number.isInteger(value);

const isValidPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/.test(value);
const isValidUUID = (uuid) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  );

module.exports = { isValidString, isInteger, isValidPassword, isValidUUID };
