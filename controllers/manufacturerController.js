const Synth = require('../models/synth');
const Manufacturer = require('../models/manufacturer');
const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Display all manufacturers
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

// Display manufacturer detail
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

// Display manufacturer form on GET
exports.manufacturer_edit_get = function (req, res, next) {
  Manufacturer.findById(req.params.id).exec(function (err, manufacturer) {
    if (err) {
      return next(err);
    }

    if (manufacturer == null) {
      const err = new Error('Manufacturer not found');
      err.status = 404;
      return next(err);
    }

    res.render('manufacturer_form', {
      manufacturer: manufacturer,
    });
  });
};

// Handle manufacturer edit on POST
exports.manufacturer_edit_post = [
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const manufacturer = new Manufacturer({
      title: req.body.title,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Manufacturer.findById(req.params.id).exec(function (err, manufacturer) {
        if (err) {
          return next(err);
        }

        res.render('manufacturer_form', {
          manufacturer: manufacturer,
        });
      });
    } else {
      Manufacturer.findByIdAndUpdate(
        req.params.id,
        manufacturer,
        {},
        function (err, theCompany) {
          if (err) {
            return next(err);
          }

          res.redirect(theCompany.url);
        }
      );
    }
  },
];

// Display manufacturer delete on GET
exports.manufacturer_delete_get = function (req, res, next) {
  async.parallel(
    {
      manufacturer: function (callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
      synths: function (callback) {
        Synth.find({ manufacturer: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.manufacturer === null) {
        res.redirect('/catalog/manufacturers');
      }

      res.render('manufacturer_delete', {
        manufacturer: results.manufacturer,
        synths: results.synths,
      });
    }
  );
};

// Handle manufacturer delete on POST
exports.maanufacturer_delete_post = function (req, res, next) {
  async.parallel(
    {
      manufacturer: function (callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
      synths: function (callback) {
        Synth.find({ manufacturer: req.body.manufacturerid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      if (results.synths.length > 0) {
        res.render('manufacturer_delete', {
          manufacturer: results.manufacturer,
          synths: results.synths,
        });

        return;
      } else {
        Manufacturer.findByIdAndRemove(
          req.body.manufacturerid,
          function deleteManufacturer(err) {
            if (err) {
              return next(err);
            }

            res.redirect('/catalog/manufacturers');
          }
        );
      }
    }
  );
};
