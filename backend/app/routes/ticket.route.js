const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticket.controller');
// const optionalVerifyJWT = require('../middlewares/optionalVerifyJWT');

router.post('/create', controller.create_ticket);

module.exports = router;