const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');

// Connexion à la base de données MongoDB hébergée via MongoDB Atlas
mongoose.connect('mongodb+srv://dotadouze:t394QxMcrKcDeyII@cluster0.tyujc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, // Utilisation du nouvel analyseur d'URL de MongoDB
    useUnifiedTopology: true }) // Utilisation du nouveau moteur de gestion de connexions MongoDB
  .then(() => console.log('Connexion à MongoDB réussie !')) // Message en cas de succès de la connexion
  .catch(() => console.log('Connexion à MongoDB échouée !')); // Message en cas d'échec de la connexion

const app = express(); // Initialisation de l'application Express

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à toutes les origines d'accéder à l'API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Autorise certains en-têtes spécifiques dans les requêtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Autorise certaines méthodes HTTP
    next(); // Passe au middleware suivant
});

app.use(bodyParser.json()); // Middleware pour parser le corps des requêtes en JSON
app.use(express.json()); // Autre méthode pour parser les requêtes JSON (équivalent moderne)

app.use('/api/books', booksRoutes); // Routes pour gérer les opérations liées aux livres
app.use('/api/auth', userRoutes); // Routes pour gérer l'authentification des utilisateurs
app.use('/images', express.static(path.join(__dirname, 'images'))); // Middleware pour servir les fichiers statiques (comme les images)

module.exports = app; // Exportation de l'application pour l'utiliser ailleurs (par exemple dans server.js)
