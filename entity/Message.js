const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Message",
  tableName: "messages",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    content: {
      type: "varchar",
    },
  },
});
