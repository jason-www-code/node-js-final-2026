const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CoachLinkSkill",
  tableName: "COACH_LINK_SKILL",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid", nullable: false },
    coach_id: { type: "uuid", nullable: false },
    skill_id: { type: "uuid", nullable: false },
    created_at: { type: "timestamp", createDate: true, nullable: false },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    coach: {
      type: "many-to-one",
      target: "Coach",
      joinColumn: { name: "coach_id" },
      onDelete: "CASCADE",
    },
    skill: {
      type: "many-to-one",
      target: "Skills", // ← 對應 Entity 的 name，不是 tableName
      joinColumn: { name: "skill_id" }, // ← 對應本表的欄位名
      onDelete: "CASCADE",
    },
  },
});

// coach_id, skill_id（各有 relation，onDelete CASCADE）
