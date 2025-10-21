const User = require('../models/user.model');
const Comment = require('../models/comment.model');

exports.getProfile = async (req, res, next) => {
    try {
        const { username } = req.params;
        const loggedinUserId = req.userId;

        const [user, loggedinUser] = await Promise.all([
            User.findOne({ username }).exec(),
            loggedinUserId ? User.findById(loggedinUserId).exec() : null
        ]);

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ profile: await user.toProfileJSON(loggedinUser) });
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
        await userToFollow.updateFollowersCount(loggedinUser);

        return res.status(200).json({ profile: await userToFollow.toProfileJSON(loggedinUser) });
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

        return res.status(200).json({ profile: await userToUnfollow.toProfileJSON(loggedinUser) });
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

        if (!user) return res.status(404).json({ message: 'User not found' });

        const followers = await User.find({ followingUsers: user._id }).exec();
        const profiles = await Promise.all(followers.map(follower => follower.toProfileJSON(loggedinUser)));

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

        if (!user) return res.status(404).json({ message: 'User not found' });

        const following = await User.find({ _id: { $in: user.followingUsers } }).exec();
        const profiles = await Promise.all(following.map(fu => fu.toProfileJSON(loggedinUser)));

        return res.status(200).json({ profiles });
    } catch (err) {
        next(err);
    }
};

exports.getFavorites = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).populate('favouriteEvento').exec();

        if (!user) return res.status(404).json({ message: 'User not found' });

        const eventos = user.favouriteEvento.map(evento => evento.toEventoResponse());

        return res.status(200).json({ eventos });
    } catch (err) {
        next(err);
    }
};

exports.getComments = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).exec();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Coherente con schema: Comment.author guarda User._id (String)
        const comments = await Comment.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate('evento')
            .exec();

        const commentsResponse = await Promise.all(
            comments.map(async (comment) => {
                const base = await comment.toCommentResponse(); // resuelve author si es necesario
                return {
                    ...base,
                    evento: comment.evento ? comment.evento.toEventoResponse() : undefined
                };
            })
        );

        return res.status(200).json({ comments: commentsResponse });
    } catch (err) {
        next(err);
    }
};
