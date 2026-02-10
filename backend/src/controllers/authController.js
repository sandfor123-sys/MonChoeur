const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Veuillez remplir tous les champs' });
        }

        // Check if user exists
        const userExists = await User.exists(email, username);
        if (userExists) {
            return res.status(400).json({ error: 'L\'utilisateur ou l\'email existe déjà' });
        }

        // Create user
        const userId = await User.create({ username, email, password });
        const user = await User.findById(userId);

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findByEmail(email);

        if (user && (await require('bcryptjs').compare(password, user.password_hash))) {
            res.json({
                token: generateToken(user.id),
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
