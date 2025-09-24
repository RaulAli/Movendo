const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');

router.get('/categories', controller.listar);

router.post('/categories', controller.crear);

router.get('/categories/:slug', controller.obtener);

router.put('/categories/:slug', controller.actualizar);

router.delete('/categories/:slug', controller.borrar);

module.exports = router;