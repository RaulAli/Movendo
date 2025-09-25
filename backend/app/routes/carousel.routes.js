const express = require('express');
const router = express.Router();

const controller = require('../controllers/carousel.controller');

router.get('/carousel/category', controller.get_carousel_category);

router.get('/carousel/evento/:slug', controller.get_carousel_evento);

module.exports = router;
