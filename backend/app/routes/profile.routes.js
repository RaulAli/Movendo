const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');
const controller = require('../controllers/profile.controller');

router.get('/:username', controller.getProfile);

router.post('/:username/follow', verifyJWT, controller.followUser);

router.delete('/:username/follow', verifyJWT, controller.unfollowUser);

module.exports = router;