const express = require('express');
const router = express.Router();

const controller = require('../controllers/carousel.controller');

router.get('/carousel/categories', controller.get_carousel_categories);

router.get('/carousel/product/:slug', controller.get_carousel_product);

module.exports = router;
