const sharp = require("sharp");
const path = require("path");
const fs = require("fs"); // Importer le module fs pour gérer les fichiers

const processImage = (req, res, next) => {
    if (req.file) {
        console.log("File received :", req.file);

        // Définir le chemin vers le dossier images
        const imageDir = path.join(__dirname, "../images"); // Chemin vers le dossier images

        // Générer un nom de fichier WebP unique
        const webpFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const webpImagePath = path.join(imageDir, webpFilename); // Chemin complet vers le fichier WebP

        const newWidth = 463;
        const newHeight = 595;

        // Choisir entre 'buffer' (fichier en mémoire) ou 'path' (fichier sur disque)
        const input = req.file.buffer ? req.file.buffer : req.file.path;

        // Traitement de l'image avec sharp
        sharp(input)
            .resize(newWidth, newHeight)
            .webp({ quality: 50 })
            .toFile(webpImagePath, (err, info) => {
                if (err) {
                    console.error("Image processing error :", err);
                    return res.status(500).json({ error: "Image processing error" });
                }

                console.log("Image processed and saved as WebP :", info);

                // Mise à jour de req.file pour refléter les nouvelles informations sur l'image
                req.file.filename = webpFilename;
                req.file.path = webpImagePath;

                // Supprimer l'image originale si elle est stockée sur disque
                if (req.file.path && !req.file.buffer) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error("Error deleting original image:", err);
                        } else {
                            console.log("Original image deleted successfully.");
                        }
                    });
                }

                next(); // Passer au middleware suivant
            });
    } else {
        console.log("No file received");
        next(); // Passer au middleware suivant
    }
};

module.exports = processImage;
