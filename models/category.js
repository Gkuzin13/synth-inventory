const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema({
  title: String,
  description: String,
});

module.exports = mongoose.model("Category", CategorySchema);
