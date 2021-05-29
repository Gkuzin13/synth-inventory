const Synth = require('../models/synth');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const async = require('async');

exports.index = function (req, res) {
  async.parallel(
    {
      synth_count: function (callback) {
        Synth.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render('index', {
        title: 'Synth Store',
        error: err,
        data: results,
      });
    }
  );
};

// Display all synths
exports.synth_list = function (req, res, next) {
  Synth.find({}, 'manufacturer name')
    .populate('manufacturer')
    .exec(function (err, list_synths) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('synth_list', {
        title: 'Synth List',
        synth_list: list_synths,
      });
    });
};

// Display synth detail
exports.synth_detail = function (req, res, next) {
  Synth.findById(req.params.id)
    .populate('synth')
    .populate('category')
    .populate('manufacturer')
    .exec(function (err, synth) {
      if (err) {
        return next(err);
      }
      if (synth == null) {
        // No results.
        var err = new Error('Synth not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('synth_detail', {
        synth: synth,
      });
    });
};

// exports.synth_create_get = function(req, res, next) {
//   async.parallel({
//     manufacturers: function(callback) {
//       Manufacturer.find(callback)
//     },
//     categories: function(callback) {
//       Category.find(callback)
//     },
//   },
//   function(err, results) {
//     if(err) {
//       return next(err)
//     }
//     res.render
//   })
// }
