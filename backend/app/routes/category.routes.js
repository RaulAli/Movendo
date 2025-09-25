const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');

router.get('/category', controller.listar);

router.post('/category', controller.crear);

router.get('/category/:slug', controller.obtener);

router.put('/category/:slug', controller.actualizar);

router.delete('/category/:slug', controller.borrar);

module.exports = router;