const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ error: 'Non autorisé, utilisateur non trouvé' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ error: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Non autorisé, aucun token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Accès refusé, droits administrateur requis' });
    }
};

module.exports = { protect, admin };
