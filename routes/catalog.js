const express = require('express');
const router = express.Router();

const synth_controller = require('../controllers/synthController');
const manufacturer_controller = require('../controllers/manufacturerController');

router.get('/', synth_controller.index);

router.get('/synths', synth_controller.synth_list);

router.get('/synth/:id', synth_controller.synth_detail);

router.get('/manufacturer/:id', manufacturer_controller.manufacturer_detail);

router.get('/manufacturers', manufacturer_controller.manufacturer_list);

module.exports = router;
