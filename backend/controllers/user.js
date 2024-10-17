const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

// Utilisation d'une clé secrète pour les tokens JWT, depuis les variables d'environnement ou clé par défaut
const secret = process.env.JWT_SECRET || 'defaultSecretKey';

// Limitation du nombre de tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 5, // Limite à 5 tentatives de connexion par IP dans la fenêtre définie
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes'
});

// Fonction pour vérifier la robustesse du mot de passe
function isStrongPassword(password) {
    const minLength = 8; // Longueur minimale de 8 caractères
    const hasUpperCase = /[A-Z]/.test(password); // Vérifie la présence d'au moins une majuscule
    const hasLowerCase = /[a-z]/.test(password); // Vérifie la présence d'au moins une minuscule
    const hasNumbers = /[0-9]/.test(password); // Vérifie la présence d'au moins un chiffre
    const hasSpecialChar = /[\W_]/.test(password); // Vérifie la présence d'au moins un caractère spécial

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar
    );
}

// Fonction d'inscription d'un utilisateur
exports.signup = (req, res, next) => {
    // Valide l'email avant de continuer
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    // Vérifie si le mot de passe respecte les critères de complexité
    if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({
            message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        });
    }

    // Hachage du mot de passe avec un coût de 12 (pour plus de sécurité)
    bcrypt.hash(req.body.password, 12) 
        .then(hash => {
            // Création d'un nouvel utilisateur avec l'email et le mot de passe haché
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Sauvegarde de l'utilisateur dans la base de données
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé!' })) // Réponse en cas de succès
                .catch(error => res.status(400).json({ error })); // Réponse en cas d'erreur de sauvegarde
        })
        .catch(error => res.status(500).json({ error })); // Réponse en cas d'erreur de hachage
};

// Fonction de connexion d'un utilisateur
exports.login = (req, res, next) => {
    // Valide l'email avant de continuer
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ message: 'Email invalide' });
    }

    // Recherche d'un utilisateur avec l'email fourni
    User.findOne({ email: req.body.email })
        .then(user => {
            // Si aucun utilisateur n'est trouvé, renvoie une erreur
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            // Comparaison du mot de passe entré avec le mot de passe haché dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le mot de passe est incorrect, renvoie une erreur
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    // Si le mot de passe est correct, génère un token JWT
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id }, // Données contenues dans le token
                            secret, // Clé secrète pour signer le token
                            { expiresIn: '24h' } // Durée de validité du token (24 heures)
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })); // Erreur lors de la comparaison des mots de passe
        })
        .catch(error => res.status(500).json({ error })); // Erreur lors de la recherche de l'utilisateur
};

// Exportation du middleware de limitation des tentatives de connexion
exports.loginLimiter = loginLimiter;
