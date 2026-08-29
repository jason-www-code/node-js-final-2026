const { DataSource } = require("typeorm");

const config = require("../config/index");
const User = require("../entities/User");
const Skill = require("../entities/Skill");
const Coach = require("../entities/Coach");
const CreditPackage = require("../entities/CreditPackage");
const Course = require("../entities/Course");
const CoachLinkSkill = require("../entities/CoachLinkSkill");
const CreditPurchase = require("../entities/CreditPurchase");
const CourseBooking = require("../entities/CourseBooking");

const dataSource = new DataSource({
  type: "postgres",
  host: config.getEnv("db.host"),
  port: Number(config.getEnv("db.port")),
  username: config.getEnv("db.username"),
  password: config.getEnv("db.password"),
  database: config.getEnv("db.database"),
  synchronize: config.getEnv("db.synchronize"),
  ssl: config.getEnv("db.ssl"),
  entities: [
    User,
    Skill,
    Coach,
    CreditPackage,
    Course,
    CoachLinkSkill,
    CreditPurchase,
    CourseBooking
  ],
});

module.exports = { dataSource };
