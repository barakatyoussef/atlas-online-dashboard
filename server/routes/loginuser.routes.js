const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Import de la connexion MySQL
const router = express.Router();

router.post("/login", (req, res) => {
    const { matricule, passWord} = req.body;

    console.log("Requête reçue:", req.body);

    db.query(
        "SELECT * FROM users WHERE matricule = ?",
        [matricule],
        (err, result) => {
            if (err) {
                console.error("Erreur SQL:", err);
                return res.status(500).json({ message: "Erreur serveur", error: err });
            }

            if (result.length === 0) {
                return res.status(404).json({ message:"Utilisateur non trouvé "});
            }

            const user=result[0]

                bcrypt.compare(passWord, user.passWord, (err, isMatch) => {
                    if (err) {
                        console.error("Erreur bcrypt:", err);
                        return res.status(500).json({ message: "Erreur serveur", error: err });
                    }
                    console.log(isMatch)

                    if (!isMatch) {
                        return res.status(401).json({ message: "Mot de passe incorrect" });
                    }

                    res.json({ message: "Connexion réussie", user });
                });
            }   
    );
});

router.post("/add-user", (req, res) => {
    const { nom, prenom, passWord, matricule, role } = req.body;

    if (!nom || !prenom || !passWord || !matricule || !role) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si le matricule existe déjà
    db.query("SELECT id FROM users WHERE matricule = ?", [matricule], (err, result) => {
        if (err) {
            console.error("Erreur SQL vérification matricule:", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        
        if (result.length > 0) {
            return res.status(400).json({ message: "Matricule déjà utilisé !" });
        }

        // Hasher le mot de passe avant insertion
        bcrypt.hash(passWord, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Erreur bcrypt:", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            // Insérer l'utilisateur avec le matricule
            db.query(
                "INSERT INTO users (nom, prenom, password, role, matricule) VALUES (?, ?, ?, ?, ?)",
                [nom, prenom, hashedPassword, role, matricule],
                (err, result) => {
                    if (err) {
                        console.error("Erreur insertion SQL:", err);
                        return res.status(500).json({ message: "Erreur serveur" });
                    }

                    res.json({ 
                        message: "Utilisateur ajouté avec succès", 
                        id: result.insertId // Retourner l'ID du nouvel utilisateur
                    });
                }
            );
        });
    });
});
module.exports = router;