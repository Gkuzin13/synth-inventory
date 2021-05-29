const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema({
  title: String,
  description: String,
});

ManufacturerSchema.virtual('url').get(function () {
  return '/catalog/manufacturer/' + this._id;
});

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);
