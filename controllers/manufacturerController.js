const Synth = require('../models/synth');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const async = require('async');

exports.manufacturer_list = function (req, res, next) {
  Manufacturer.find()
    .sort([['title', 'ascending']])
    .exec(function (err, list_manufacturers) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('manufacturer_list', {
        title: 'Manufacturer List',
        manufacturer_list: list_manufacturers,
      });
    });
};

exports.manufacturer_detail = function (req, res, next) {
  async.parallel(
    {
      manufacturer: function (callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
      manufacturer_synths: function (callback) {
        Synth.find({ manufacturer: req.params.id }, 'name description').exec(
          callback
        );
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.manufacturer == null) {
        const err = new Error('Manufacturer not found');
        err.status = 404;
        return next(err);
      }

      res.render('manufacturer_detail', {
        manufacturer: results.manufacturer,
        synths: results.manufacturer_synths,
      });
    }
  );
};
