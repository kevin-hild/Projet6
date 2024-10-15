const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');  // Multer configuré pour gérer les fichiers
const sharp = require('../middleware/sharp-config');   // Middleware Sharp pour redimensionner et convertir

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks);

// Routes avec création et modification de livre, où sharp est nécessaire
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.put('/:id', auth, multer, sharp, bookCtrl.modifyBook);

// Autres routes qui n'impliquent pas le traitement d'images
router.post('/:id/rating', auth, bookCtrl.addBookRating);
router.get('/:id', bookCtrl.getOneBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;