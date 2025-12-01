const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/ajouterVol", (req, res) => {
  const { datevol, numvol, parcours, typeReg, passagers, agent } = req.body;

  // Vérification que tous les champs nécessaires sont présents
  if (!datevol || !numvol || !parcours || !typeReg || !passagers || !agent) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // Agent est directement envoyé comme un champ complet, on l'insère tel quel
  const agentName = agent; // Si agent est un seul champ contenant nom et prénom

  const sqlInsertVol = "INSERT INTO vols (datevol, numvol, parcours, type_irreg, agent) VALUES (?, ?, ?, ?, ?)";
  
  // Exécution de la requête avec les bonnes valeurs
  db.query(sqlInsertVol, [datevol, numvol, parcours, typeReg, agentName], (err, result) => {
    if (err) {
      console.error("Erreur d'insertion du vol :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    
    const volId = result.insertId;  // Récupérer l'ID du vol inséré
    console.log("Vol inséré avec succès. ID vol:", volId);
    console.log("Passagers reçus :", passagers);

    // Insertion des passagers dans la table 'passager'
    const sqlInsertPassager = "INSERT INTO passager (PNR, nomcomplet, Statut_Email, Statut_SMS, id_vol, Date_insertion) VALUES ?";
    const values = passagers.map(passager => [
      passager.pnr,
      passager.nomcomplet,
      passager.Statut_Email || "Non envoyé", // Valeur par défaut si non définie
      passager.Statut_SMS || "Non envoyé",   // Valeur par défaut si non définie
      volId,  // Associer le vol à l'ID
      new Date(),  // Date actuelle d'insertion
    ]);

    console.log("Valeurs préparées pour insertion des passagers :", values);

    // Insertion des passagers
    db.query(sqlInsertPassager, [values], (err) => {
      if (err) {
        console.error("Erreur d'insertion des passagers", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.json({ message: "✅ Vol et passagers enregistrés avec succès !" });
    });
  });
});

module.exports = router;