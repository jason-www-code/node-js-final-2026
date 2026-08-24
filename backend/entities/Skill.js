const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Skills",
  tableName: "SKILLS",
  columns: {
    id: {
      type: "uuid",
      generated: "uuid",
      primary: true,
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
});
