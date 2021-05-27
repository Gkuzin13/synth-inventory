const mongoose = require("mongoose");
const { Schema } = mongoose;

const SynthSchema = new Schema({
  name: String,
  description: String,
  in_stock: Number,
  price: Number,
  release_date: Date,
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  manufacturer: [{ type: Schema.Types.ObjectId, ref: "Manufacturer" }],
});

module.exports = mongoose.model("Synth", SynthSchema);
