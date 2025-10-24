// controllers/user.controller.js
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedToken.model');

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

    const accessToken = loginUser.generateAccessToken();

    const refreshToken = loginUser.generateRefreshToken();

    await loginUser.addRefreshToken(refreshToken);

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ user: { ...loginUser.toUserResponse(), token: accessToken } });
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

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); // Forbidden

    // Evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err || foundUser._id !== decoded.id) return res.sendStatus(403); // Forbidden

            // Refresh token was valid
            const accessToken = foundUser.generateAccessToken();
            const newRefreshToken = foundUser.generateRefreshToken();

            // Update refresh token in DB
            await foundUser.removeRefreshToken(refreshToken);
            await foundUser.addRefreshToken(newRefreshToken);

            res.cookie('jwt', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ user: { ...foundUser.toUserResponse(), token: accessToken } });
        }
    );
});

const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshTokens: refreshToken }).exec();
    if (foundUser) {
        await foundUser.removeRefreshToken(refreshToken);
    }

    // Blacklist the access token if present
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('Logout: Received authHeader:', authHeader);

    if (authHeader) {
        const parts = authHeader.split(' ');
        console.log('Logout: Header parts:', parts);

        if (parts.length === 2 && (/^Bearer$/i.test(parts[0]) || /^Token$/i.test(parts[0]))) {
            const accessToken = parts[1];
            console.log('Logout: Extracted accessToken:', accessToken);

            try {
                const decoded = jwt.decode(accessToken); // Decode without verification to get expiry
                console.log('Logout: Decoded accessToken (payload):', decoded);

                if (decoded && decoded.exp) {
                    const expiresAt = new Date(decoded.exp * 1000); // exp is in seconds, convert to ms
                    console.log('Logout: Token expiresAt:', expiresAt);

                    await BlacklistedToken.create({ token: accessToken, expiresAt });
                    console.log('Logout: Access token successfully blacklisted.');
                } else {
                    console.log('Logout: Decoded token has no exp claim or is invalid.');
                }
            } catch (error) {
                console.error('Logout: Error decoding access token for blacklisting:', error);
            }
        } else {
            console.log('Logout: Authorization header format invalid.');
        }
    } else {
        console.log('Logout: No Authorization header present.');
    }

    res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
});

module.exports = {
    registerUser,
    getCurrentUser,
    userLogin,
    updateUser,
    handleRefreshToken,
    logout
};
