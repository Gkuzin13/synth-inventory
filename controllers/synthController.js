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

// Display synth add form on GET
exports.synth_add_get = function (req, res, next) {
  async.parallel(
    {
      manufacturers: function (callback) {
        Manufacturer.find(callback);
      },
      categories: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('synth_form', {
        manufacturers: results.manufacturers,
        categories: results.categories,
      });
    }
  );
};

// Display synth add on POST
exports.synth_add_post = [
  // Convert manufacturer to an array
  (req, res, next) => {
    if (!(req.body.manufacturer instanceof Array)) {
      if (typeof req.body.manufacturer === 'undefined')
        req.body.manufacturer = [];
      else req.body.manufacturer = new Array(req.body.manufacturer);

      next();
    }
  },

  // Validate and sanitise fields
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('in_stock', 'Stock number cannot be a negative.')
    .trim()
    .isFloat({ min: 0 })
    .escape(),
  body('price', 'Price can not be less than 1.')
    .trim()
    .isFloat({ min: 1 })
    .escape(),
  body('release_date', 'Release Date must be a valid date.')
    .trim()
    .isDate()
    .escape(),
  body('category.*').escape(),
  body('manufacturer.*').escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const synth = new Synth({
      name: req.body.name,
      description: req.body.description,
      in_stock: req.body.in_stock,
      price: req.body.price,
      release_date: req.body.release_date,
      category: req.body.category,
      manufacturer: req.body.manufacturer,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          manufacturers: function (callback) {
            Manufacturer.find(callback);
          },
          categories: function (callback) {
            Category.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('synth_form', {
            manufacturers: results.manufacturers,
            categories: results.categories,
          });
        }
      );

      return;
    } else {
      synth.save(function (err) {
        if (err) {
          return next(err);
        }

        res.redirect(synth.url);
      });
    }
  },
];
