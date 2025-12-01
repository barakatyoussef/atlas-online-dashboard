const express = require("express");
const router = express.Router();
const bcrypt=require("bcryptjs")
const db = require("../config/db");

router.get("/users", (req, res) => {
    const sql = "SELECT id, nom, prenom, role,matricule FROM users";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
    
        res.json(result);
    });
});



router.put("/users/:id", (req, res) => {
    console.log("📥 Données reçues pour mise à jour :", req.body);
    const { nom, prenom, role, passWord, matricule } = req.body;
    const userId = req.params.id;

    if (!matricule) {
        console.log("⚠️ Matricule manquant !");
        return res.status(400).json({ message: "Le matricule est obligatoire" });
    }

    // Vérifier si le matricule appartient déjà à un autre utilisateur
    db.query(
        "SELECT id FROM users WHERE matricule = ? AND id != ?",
        [matricule, userId],
        (err, result) => {
            if (err) {
                console.error("❌ Erreur SQL vérification matricule :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            console.log("🔍 Résultat vérification matricule :", result);

            if (result.length > 0) {
                console.log("⚠️ Matricule déjà utilisé par un autre utilisateur !");
                return res.status(400).json({ message: "Matricule déjà utilisé !" });
            }

            let sql;
            let values;

            if (passWord) {
                const hashedPassword = bcrypt.hashSync(passWord, 10);
                sql = "UPDATE users SET nom = ?, prenom = ?, role = ?, password = ?, matricule = ? WHERE id = ?";
                values = [nom, prenom, role, hashedPassword, matricule, userId];
            } else {
                sql = "UPDATE users SET nom = ?, prenom = ?, role = ?, matricule = ? WHERE id = ?";
                values = [nom, prenom, role, matricule, userId];
            }

            console.log("🛠️ Exécution de la requête SQL :", sql, values);

            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("❌ Erreur mise à jour utilisateur :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }

                console.log("✅ Mise à jour réussie :", result);
                res.json({ message: "Utilisateur mis à jour avec succès" });
            });
        }
    );
});
router.delete("/supprimerUser/:id",(req,res)=>{
    const {id}=req.params

    const sql ="DELETE FROM users WHERE id = ? "
    db.query(sql,[id],(err,result)=>{
        if(err){
            console.error("Erreur suppression utilisateur:",err)
            return res.status(500).json({message:"Erreur du serveur"})
        }
        res.json({message:"utilisateur supprime avec succes"})
    })
})

module.exports = router;