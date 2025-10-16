const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT')
const controller = require('../controllers/comment.controller');

// //Obtener la información
// router.get('/comment/:slug', controller.getCommentFromEvento);

// //Crear un comentario
// router.post('/comment/:slug', verifyJWT, controller.createCommentForEvento);

// //Eliminar un comentario
// router.delete('/comment/:slug/:id', verifyJWT, controller.deleteCommentFromEvento);

//Crear un comentario
router.post('/:slug/comment', verifyJWT, controller.createCommentForEvento);

//Obtener la información
router.get('/:slug/comment', controller.getCommentFromEvento);

//Eliminar un comentario
router.delete('/:slug/comment/:id', verifyJWT, controller.deleteCommentFromEvento);

module.exports = router;