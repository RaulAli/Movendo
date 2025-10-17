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
        loggedinUser.followingCount = loggedinUser.followingUsers.length;
        await loggedinUser.save();
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
        loggedinUser.followingCount = loggedinUser.followingUsers.length;
        await loggedinUser.save();
        await userToUnfollow.updateFollowersCount(loggedinUser);

        return res.status(200).json({ profile: userToUnfollow.toProfileJSON(loggedinUser) });
    } catch (err) {
        next(err);
    }
};

exports.getFollowers = async (req, res, next) => {
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

        const followers = await User.find({ followingUsers: user._id }).exec();
        const profiles = followers.map(follower => follower.toProfileJSON(loggedinUser));

        return res.status(200).json({ profiles });
    } catch (err) {
        next(err);
    }
};

exports.getFollowing = async (req, res, next) => {
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

        const following = await User.find({ _id: { $in: user.followingUsers } }).exec();
        const profiles = following.map(_followingUser => _followingUser.toProfileJSON(loggedinUser));

        return res.status(200).json({ profiles });
    } catch (err) {
        next(err);
    }
};