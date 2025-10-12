// controllers/user.controller.js
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// Registro
const registerUser = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.username || !user.password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPwd = await bcrypt.hash(user.password, 10); // salt rounds

    const userObject = {
        username: user.username,
        password: hashedPwd,
        email: user.email
    };

    const createdUser = await User.create(userObject);

    if (createdUser) {
        return res.status(201).json({ user: createdUser.toUserResponse() });
    } else {
        return res.status(422).json({ errors: { body: "Unable to register a user" } });
    }
});

// Obtener usuario actual (protegido)
const getCurrentUser = asyncHandler(async (req, res) => {
    const email = req.userEmail;
    if (!email) return res.status(401).json({ message: 'No autenticado' });

    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ message: "User Not Found" });

    return res.status(200).json({ user: user.toUserResponse() });
});

// Login
const userLogin = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const loginUser = await User.findOne({ email: user.email }).exec();
    if (!loginUser) return res.status(404).json({ message: "User Not Found" });

    const match = await bcrypt.compare(user.password, loginUser.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized: Wrong password' });

    return res.status(200).json({ user: loginUser.toUserResponse() });
});

// Update user (protegido)
const updateUser = asyncHandler(async (req, res) => {
    const { user } = req.body;
    if (!user) return res.status(400).json({ message: "Required a User object" });

    const email = req.userEmail;
    if (!email) return res.status(401).json({ message: 'No autenticado' });

    const target = await User.findOne({ email }).exec();
    if (!target) return res.status(404).json({ message: 'User Not Found' });

    if (user.email) target.email = user.email;
    if (user.username) target.username = user.username;
    if (user.password) target.password = await bcrypt.hash(user.password, 10);
    if (typeof user.image !== 'undefined') target.image = user.image;
    if (typeof user.bio !== 'undefined') target.bio = user.bio;

    await target.save();
    return res.status(200).json({ user: target.toUserResponse() });
});

module.exports = {
    registerUser,
    getCurrentUser,
    userLogin,
    updateUser
};
