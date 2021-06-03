const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SynthSchema = new Schema({
  name: String,
  description: String,
  in_stock: Number,
  price: Number,
  release_date: Date,
  img_url: String,
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  manufacturer: [{ type: Schema.Types.ObjectId, ref: 'Manufacturer' }],
});

SynthSchema.virtual('url').get(function () {
  return '/catalog/synth/' + this._id;
});

module.exports = mongoose.model('Synth', SynthSchema);
