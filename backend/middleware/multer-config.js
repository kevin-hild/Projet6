const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du stockage en mémoire pour multer
const storage = multer.memoryStorage();  // Stocke les fichiers téléchargés en mémoire (RAM)

// Fonction de filtrage des fichiers (fileFilter)
const fileFilter = (req, file, callback) => {  
  if (MIME_TYPES[file.mimetype]) {       // Vérifie si le type MIME du fichier est dans la liste des types acceptés
    callback(null, true);                // Si le type MIME est accepté, accepte le fichier
  } else {
    callback(new Error('Invalid file type.'));  // Sinon, génère une erreur pour type de fichier invalide
  }
};

// Exportation de la configuration multer avec le stockage et le filtrage des fichiers
module.exports = multer({ storage: storage, fileFilter: fileFilter }).single('image'); // Gère un seul fichier nommé 'image'

