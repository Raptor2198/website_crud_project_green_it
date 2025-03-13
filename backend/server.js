// Chargement des variables d'environnement depuis un fichier .env
require("dotenv").config();

// Importation des modules nécessaires
const express = require("express");
const mysql = require("mysql2"); // Utilisation de mysql2 pour la connexion MySQL
const cors = require("cors");
const compression = require("compression"); // Pour compresser les réponses HTTP (réduction de la bande passante)
const multer = require("multer"); // Pour gérer l'upload d'images
const path = require("path");
const fs = require("fs");

const app = express();

// Configuration des middlewares globaux
app.use(cors());
app.use(express.json());
app.use(compression()); // Applique la compression gzip pour réduire la taille des réponses

// === Optimisation Green IT : Mise en cache simple en mémoire ===
// Cette solution permet de réduire les appels répétés à la base de données.
// Le cache est stocké pendant une courte durée pour garantir que les données restent fraîches.
let produitsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3 * 1000; // Durée du cache : 3 secondes

// === Connexion à MySQL ===
// On se connecte à la base de données MySQL en utilisant les informations du fichier .env.
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// === Configuration de Multer pour stocker les images uploadées ===
// Les images sont stockées dans le dossier "../frontend/boutique/public/images/"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../frontend/boutique/public/images/"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Utilise un timestamp pour générer un nom unique pour chaque image
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// === Routes de l'API ===

// 🔹 Route pour récupérer tous les produits avec cache
app.get("/produits", (req, res) => {
    const now = Date.now();
    // Si le cache est valide (moins de 3 secondes), retourner les données mises en cache
    if (produitsCache && (now - cacheTimestamp < CACHE_DURATION)) {
        // Définir un en-tête HTTP pour indiquer que la réponse peut être mise en cache côté client pendant 3 secondes
        return res.set("Cache-Control", "public, max-age=3").json(produitsCache);
    }

    // Sinon, interroger la base de données
    db.query("SELECT * FROM produits", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Mettre en cache le résultat et enregistrer le timestamp
        produitsCache = result;
        cacheTimestamp = now;

        res.set("Cache-Control", "public, max-age=3").json(result);
    });
});

// 🔹 Route pour récupérer un produit par ID (utilise le cache s'il existe)
app.get("/produits/:id", (req, res) => {
    const { id } = req.params;

    if (produitsCache) {
        const produit = produitsCache.find(p => p.id == id);
        if (produit) {
            return res.set("Cache-Control", "public, max-age=3").json(produit);
        }
    }

    // Si le produit n'est pas dans le cache, on le récupère de la base de données
    db.query("SELECT * FROM produits WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Produit non trouvé" });
        res.set("Cache-Control", "public, max-age=3").json(result[0]);
    });
});

// 🔹 Route pour ajouter un produit avec une image
app.post("/produits", upload.single("image"), (req, res) => {
    const { nom, description, prix } = req.body;
    // Si aucune image n'est uploadée, utiliser un placeholder
    const image = req.file ? req.file.filename : "placeholder.webp";

    db.query(
        "INSERT INTO produits (nom, description, prix, image) VALUES (?, ?, ?, ?)",
        [nom, description, prix, image],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Invalider le cache pour forcer une actualisation immédiate
            produitsCache = null;

            res.json({ id: result.insertId, nom, description, prix, image });
        }
    );
});

// 🔹 Route pour modifier un produit
app.put("/produits/:id", upload.single("image"), (req, res) => {
    const { id } = req.params;
    const { nom, description, prix } = req.body;
    const newImage = req.file ? req.file.filename : null;

    // Récupérer l'ancienne image pour la supprimer si nécessaire
    db.query("SELECT image FROM produits WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const oldImage = result[0]?.image;
        if (newImage && oldImage && oldImage !== "placeholder.webp") {
            const oldImagePath = path.join(__dirname, "../frontend/boutique/public/images/", oldImage);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        db.query(
            "UPDATE produits SET nom = ?, description = ?, prix = ?, image = COALESCE(?, image) WHERE id = ?",
            [nom, description, prix, newImage, id],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Invalider le cache pour que les modifications soient reflétées immédiatement
                produitsCache = null;

                res.json({ message: "Produit mis à jour !" });
            }
        );
    });
});

// 🔹 Route pour supprimer un produit
app.delete("/produits/:id", (req, res) => {
    const { id } = req.params;

    // Sélectionner l'image du produit pour la supprimer du système de fichiers
    db.query("SELECT image FROM produits WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            const imagePath = path.join(__dirname, "../frontend/boutique/public/images/", result[0].image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        // Supprimer le produit de la base de données
        db.query("DELETE FROM produits WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Invalider le cache pour actualiser les données
            produitsCache = null;

            res.json({ message: "Produit supprimé avec succès !" });
        });
    });
});

// 🔹 Démarrer le serveur sur le port 5000
app.listen(5000, () => console.log("🚀 Serveur Node.js sur http://localhost:5000"));
