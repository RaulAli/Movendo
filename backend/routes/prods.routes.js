
const express = require('express');
const router = express.Router();
const controller = require('../controllers/prod.controller');

router.get('/prods', controller.listar);

router.post('/prods', controller.crear);

router.get('/prods/:slug', controller.obtener);

router.put('/prods/:slug', controller.actualizar);

router.delete('/prods/:slug', controller.borrar);


module.exports = router;