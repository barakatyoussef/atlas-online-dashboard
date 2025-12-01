const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Route pour mettre à jour la synthèse des vols (éviter les doublons)
router.post("/maj-synthese", (req, res) => {
  const sql = `
    INSERT INTO synthese_vols (numvol, parcours, datevol, nombre_passagers, nbre_sms, nbre_emails, date_insertion, agent,type_irreg)
    SELECT 
      v.numvol,
      v.parcours,
      v.datevol,
      COUNT(p.id_passager) AS Nombre_Passagers,
      SUM(CASE WHEN p.Statut_SMS = 'Envoyé' THEN 1 ELSE 0 END) AS Nbre_SMS,
      SUM(CASE WHEN p.Statut_Email = 'Envoyé' THEN 1 ELSE 0 END) AS Nbre_Emails,
      MIN(p.date_insertion) AS date_insertion,
      v.agent,
      type_irreg
    FROM vols v
    INNER JOIN passager p ON v.id = p.id_vol
    GROUP BY v.numvol, v.datevol, v.agent,v.type_irreg  -- L'agent est regroupé avec les autres champs
    ON DUPLICATE KEY UPDATE
      nombre_passagers = VALUES(nombre_passagers),
      nbre_sms = VALUES(nbre_sms),
      nbre_emails = VALUES(nbre_emails),
      date_insertion = VALUES(date_insertion),
      agent = VALUES(agent),
      type_irreg = VALUES(type_irreg)
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Erreur mise à jour synthèse:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: "✅ Synthèse mise à jour sans doublons !" });
  });
});

// Route pour récupérer la synthèse
router.get("/synthese", (req, res) => {
  const {startDate,endDate,numVol,parcoursVol,dateInsertionMin,dateInsertionMax,typeIrreg}=req.query
  let sql = `
    SELECT 
      id,
      DATE_FORMAT(date_insertion, '%Y-%m-%d') AS date_insertion,
      numvol,
      parcours,
      DATE_FORMAT(datevol, '%Y-%m-%d') AS datevol,
      nombre_passagers,
      nbre_sms,
      nbre_emails,
      agent,
      type_irreg
    FROM synthese_vols
    WHERE 1 = 1
  `;
  let values=[]

  if (startDate && endDate){
    console.log(startDate,endDate)
    sql+= "AND  datevol BETWEEN ? AND ?" 
    values.push(startDate,endDate)
    
  }

  if (dateInsertionMin && dateInsertionMax){
    console.log(dateInsertionMin && dateInsertionMax)
    sql+= "AND  date_insertion BETWEEN ? AND ?" 
    values.push(dateInsertionMin,dateInsertionMax)
    
  }

  if(numVol){
    console.log(numVol)
    sql+= "AND numvol = ? "
    values.push(numVol)
  }

  if(parcoursVol){
    console.log(parcoursVol)
    sql+="AND parcours = ? "
    values.push(parcoursVol)
  }

  if(typeIrreg){
    console.log(typeIrreg)
    sql+="AND type_irreg = ? "
    values.push(typeIrreg)
  }


  sql +="ORDER BY date_insertion DESC;"

  db.query(sql,values ,(err, result) => {
    if (err) {
      console.error("Erreur récupération synthèse:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(result);
  });
});

module.exports = router;