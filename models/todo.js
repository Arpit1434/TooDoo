const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  todo_id: {
    type: String,
    default: () => {
      return randomUUID();
    },
    unique: true,
  },
});

const ToDo = mongoose.model("ToDo", todoSchema);
module.exports = ToDo;
