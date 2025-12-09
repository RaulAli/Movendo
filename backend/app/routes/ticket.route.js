const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticket.controller');
const verifyJWT = require('../middlewares/verifyJWT');

// Route to get tickets for the authenticated user
router.get('/my-tickets', verifyJWT, controller.getMyTickets);

router.post('/create', controller.create_ticket);

module.exports = router;