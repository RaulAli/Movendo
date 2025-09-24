const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');


router.get('/category', controller.listar);

router.get('/category/', controller.obtener);

router.post('/category', controller.crear);

module.exports = router;