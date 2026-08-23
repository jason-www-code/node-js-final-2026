const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Users",
  tableName: "USERS",
  columns: {
    id: {
      type: "uuid",
      generated: "uuid",
      primary: true,
      nullable: false
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 320,
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "USER",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: true,
    },
    deleteAt: {
      type: "timestamp",
      deleteDate: true,
      nullable: true,
    },
  },
});
