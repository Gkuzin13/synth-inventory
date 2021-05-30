const express = require('express');
const router = express.Router();

const synth_controller = require('../controllers/synthController');
const manufacturer_controller = require('../controllers/manufacturerController');

router.get('/', synth_controller.index);

router.get('/synths', synth_controller.synth_list);

router.get('/synth/add', synth_controller.synth_add_get);

router.post('/synth/add', synth_controller.synth_add_post);

router.get('/synth/:id/delete', synth_controller.synth_delete_get);

router.post('/synth/:id/delete', synth_controller.synth_delete_post);

router.get('/synth/:id/edit', synth_controller.synth_edit_get);

router.post('/synth/:id/edit', synth_controller.synth_edit_post);

router.get('/synth/:id', synth_controller.synth_detail);

router.get('/manufacturer/:id', manufacturer_controller.manufacturer_detail);

router.get('/manufacturers', manufacturer_controller.manufacturer_list);

module.exports = router;
