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
        title: 'Synthesizer Inventory',
        error: err,
        data: results,
      });
    }
  );
};

// Display all synths
exports.synth_list = function (req, res, next) {
  async.parallel(
    {
      synths: function (callback) {
        Synth.find(callback);
      },
      manufacturers: function (callback) {
        Manufacturer.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('synth_list', {
        manufacturers: results.manufacturers,
        synths: results.synths,
      });
    }
  );
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
        const err = new Error('Synth not found');
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

// Handle synth add on POST
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
      img_url: req.body.img_url,
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

// Synth Delete form on GET
exports.synth_delete_get = function (req, res, next) {
  async.parallel(
    {
      synth: function (callback) {
        Synth.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.synth == null) {
        res.redirect('/catalog/synths');
        return;
      }

      res.render('synth_delete', { synth: results.synth });
    }
  );
};

// Handle Synth delete on POST
exports.synth_delete_post = function (req, res, next) {
  if (req.body.password !== process.env.AUTH_PASSWORD) {
    let err = new Error('Password is incorrect!');
    err.status = 404;

    return next(err);
  }

  async.parallel(
    {
      synth: function (callback) {
        Synth.findById(req.body.synthid).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }

      Synth.findByIdAndRemove(req.body.synthid, function deleteSynth(err) {
        if (err) {
          return next(err);
        }

        res.redirect('/catalog/synths');
      });
    }
  );
};

// Display synth edit form on GET
exports.synth_edit_get = function (req, res, next) {
  async.parallel(
    {
      synth: function (callback) {
        Synth.findById(req.params.id)
          .populate('synth')
          .populate('manufacturer')
          .populate('category')
          .exec(callback);
      },
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

      if (results.synth == null) {
        let err = new Error('Synth not found');
        err.status = 404;

        return next(err);
      }

      res.render('synth_form', {
        manufacturers: results.manufacturers,
        categories: results.categories,
        synth: results.synth,
      });
    }
  );
};

// Handle synth edit on POST
exports.synth_edit_post = [
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === 'undefined') req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
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

  // Process request after validation and sanitization
  (req, res, next) => {
    if (req.body.password !== process.env.AUTH_PASSWORD) {
      let err = new Error('Password is incorrect!');
      err.status = 404;

      return next(err);
    }

    const errors = validationResult(req);

    // Create a Synth object with escaped/trimmed data with same id
    const synth = new Synth({
      name: req.body.name,
      description: req.body.description,
      in_stock: req.body.in_stock,
      price: req.body.price,
      release_date: req.body.release_date,
      img_url: req.body.img_url,
      category: req.body.category,
      manufacturer: req.body.manufacturer,
      _id: req.params.id, // Uses same id
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          synth: function (callback) {
            Synth.findById(req.params.id)
              .populate('synth')
              .populate('manufacturer')
              .populate('category')
              .exec(callback);
          },
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

          if (results.synth == null) {
            let err = new Error('Synth not found');
            err.status = 404;

            return next(err);
          }

          res.render('synth_form', {
            manufacturers: results.manufacturers,
            categories: results.categories,
            synth: results.synth,
          });
        }
      );
    } else {
      Synth.findByIdAndUpdate(
        req.params.id,
        synth,
        {},
        function (err, theSynth) {
          if (err) {
            return next(err);
          }

          res.redirect(theSynth.url);
        }
      );
    }
  },
];
