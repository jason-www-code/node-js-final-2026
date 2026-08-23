const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CreditPackage",
  tableName: "CREDIT_PACKAGE",
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
    credit_amount: {
      type: "integer",
      nullable: false,
    },
    price: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: true,
    },
    deleteAt: {
      type: "timestamp",
      createDate: true,
      nullable: true,
    },
  },
});
