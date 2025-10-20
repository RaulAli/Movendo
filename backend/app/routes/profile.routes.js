const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');
const controller = require('../controllers/profile.controller');
const optionalVerifyJWT = require('../middlewares/optionalVerifyJWT');

router.get('/:username', optionalVerifyJWT, controller.getProfile);

router.post('/:username/follow', verifyJWT, controller.followUser);

router.delete('/:username/follow', verifyJWT, controller.unfollowUser);

router.get('/:username/followers', optionalVerifyJWT, controller.getFollowers);

router.get('/:username/following', optionalVerifyJWT, controller.getFollowing);

router.get('/:username/favorites', optionalVerifyJWT, controller.getFavorites);

router.get('/:username/comments', optionalVerifyJWT, controller.getComments);

module.exports = router;