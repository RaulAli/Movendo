require('dotenv').config();
const jwt = require('jsonwebtoken');

const optionalVerifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        req.userId = undefined;
        return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        req.userId = undefined;
        return next();
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme) && !/^Token$/i.test(scheme)) {
        req.userId = undefined;
        return next();
    }

    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) throw new Error('ACCESS_TOKEN_SECRET no definido en .env');

        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.username = decoded.username;
        next();
    } catch (err) {
        // Token inválido o expirado, but we still want to proceed as unauthenticated
        req.userId = undefined;
        next();
    }
};

module.exports = optionalVerifyJWT;