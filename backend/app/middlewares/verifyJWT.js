// middleware/verifyJWT.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No Authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Formato de Authorization inválido' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme) && !/^Token$/i.test(scheme)) {
        return res.status(401).json({ message: 'Authorization scheme no soportado' });
    }

    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) throw new Error('ACCESS_TOKEN_SECRET no definido en .env');

        const decoded = jwt.verify(token, secret);
        // Esperamos payload: { id, email, username }
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.username = decoded.username;
        next();
    } catch (err) {
        // Token inválido o expirado
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verifyJWT;
