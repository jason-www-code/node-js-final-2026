const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Course",
  tableName: "COURSE",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    user_id: { type: "uuid", nullable: false },
    skill_id: { type: "uuid", nullable: false },
    name: { type: "varchar", length: 100, nullable: false },
    description: { type: "text", nullable: false },
    start_at: { type: "timestamp", nullable: false },
    end_at: { type: "timestamp", nullable: false },
    max_participants: { type: "integer", nullable: false },
    meeting_url: {
      type: "varchar",
      length: 2048,
      nullable: false,
    },
    created_at: { type: "timestamp", createDate: true, nullable: false },
    updated_at: { type: "timestamp", updateDate: true, nullable: false },
  },
  relations: {
    user: {
      target: "Users", 
      type: "many-to-one",
      joinColumn: { name: "user_id" }, 
    },
    skill: {
      target: "Skills",
      type: "many-to-one",
      joinColumn: { name: "skill_id" },
    },
  },
});
