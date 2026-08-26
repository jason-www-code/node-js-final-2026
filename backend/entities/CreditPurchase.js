const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CreditPurchase",
  tableName: "CREDIT_PURCHASE",
  columns: {
    id: {
      type: "uuid",
      generated: "uuid",
      primary: true,
      nullable: false,
    },
    user_id: { type: "uuid", nullable: false },
    credit_package_id: { type: "uuid", nullable: false },
    name: {
      type: "varchar",
      length: 50,
      nullable: false, 
    },
    price_paid: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    purchased_credits: {
      type: "integer",
      nullable: false,
    },
    purchase_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "Users",
      joinColumn: { name: "user_id" },
    },
    credit_package: {
      type: "many-to-one",
      target: "CreditPackage",
      joinColumn: { name: "credit_package_id" },
    },
  },
});
