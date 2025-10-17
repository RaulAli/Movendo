
const express = require('express');
const router = express.Router();
const controller = require('../controllers/evento.controller');
const verifyJWT = require('../middlewares/verifyJWT')

router.get('/evento', controller.listar);

router.post('/evento', controller.crear);

router.get('/evento/:slug', controller.obtener);

router.put('/evento/:slug', controller.actualizar);

router.delete('/evento/:slug', controller.borrar);

//Evento por Category

router.get('/category/:slug', controller.GetEventosByCategory);

router.get('/cities', controller.getUniqueCities);

router.get('/prices/minmax', controller.getMinMaxPrices);

// Favorites

router.post('/evento/:slug/favorite', verifyJWT, controller.addfavoriteEvento);

module.exports = router;