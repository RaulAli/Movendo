const User = require('../models/user.model');

exports.getProfile = async (req, res, next) => {
    try {
        const { username } = req.params;
        const loggedinUserId = req.userId;

        const [user, loggedinUser] = await Promise.all([
            User.findOne({ username }).exec(),
            loggedinUserId ? User.findById(loggedinUserId).exec() : null
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ profile: user.toProfileJSON(loggedinUser) });
    } catch (err) {
        next(err);
    }
};

exports.followUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const loggedinUserId = req.userId;

        const [userToFollow, loggedinUser] = await Promise.all([
            User.findOne({ username }).exec(),
            User.findById(loggedinUserId).exec()
        ]);

        if (!userToFollow || !loggedinUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await loggedinUser.follow(userToFollow._id);
        const data = await userToFollow.updateFollowersCount(loggedinUser);

        return res.status(200).json({ profile: userToFollow.toProfileJSON(loggedinUser) });
    } catch (err) {
        next(err);
    }
};

exports.unfollowUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const loggedinUserId = req.userId;

        const [userToUnfollow, loggedinUser] = await Promise.all([
            User.findOne({ username }).exec(),
            User.findById(loggedinUserId).exec()
        ]);

        if (!userToUnfollow || !loggedinUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await loggedinUser.unfollow(userToUnfollow._id);
        await userToUnfollow.updateFollowersCount(loggedinUser);

        return res.status(200).json({ profile: userToUnfollow.toProfileJSON(loggedinUser) });
    } catch (err) {
        next(err);
    }
};