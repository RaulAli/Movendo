
const express = require('express');
const router = express.Router();
const controller = require('../controllers/evento.controller');
const verifyJWT = require('../middlewares/verifyJWT')
const optionalVerifyJWT = require('../middlewares/optionalVerifyJWT');

router.get('/evento', controller.listar);

router.post('/evento', controller.crear);

router.get('/evento/:slug', optionalVerifyJWT, controller.obtener);

router.put('/evento/:slug', controller.actualizar);

router.delete('/evento/:slug', controller.borrar);

//Evento por Category

router.get('/category/:slug', controller.GetEventosByCategory);

router.get('/cities', controller.getUniqueCities);

router.get('/prices/minmax', controller.getMinMaxPrices);

// Favorites

router.post('/evento/:slug/favorite', verifyJWT, controller.addfavoriteEvento);

router.delete('/evento/:slug/favorite', verifyJWT, controller.unfavoriteEvento);

module.exports = router;