// controllers/user.controller.js
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');

// Registro
const registerUser = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.username || !user.password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPwd = await argon2.hash(user.password);

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

    const match = await argon2.verify(loginUser.password, user.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized: Wrong password' });

    return res.status(200).json({ user: loginUser.toUserResponse() });
});

const updateUser = asyncHandler(async (req, res) => {
    const { user } = req.body;
    const username = req.username;
    if (!username) return res.status(401).json({ message: 'No autenticado' });

    const updatedFields = {};
    if (user.email) updatedFields.email = user.email;
    if (user.username) updatedFields.username = user.username;
    if (typeof user.image !== 'undefined') updatedFields.image = user.image;
    if (user.password) updatedFields.password = await argon2.hash(user.password);

    const updatedUser = await User.findOneAndUpdate(
        { username },
        { $set: updatedFields },
        { new: true }
    ).exec();

    if (!updatedUser) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    return res.status(200).json({ user: updatedUser.toUserResponse() });
});

module.exports = {
    registerUser,
    getCurrentUser,
    userLogin,
    updateUser
};
