const mongoose = require("mongoose");
const { Schema } = mongoose;

const ManufacturerSchema = new Schema({
  title: String,
  description: String,
});

module.exports = mongoose.model("Manufacturer", ManufacturerSchema);
