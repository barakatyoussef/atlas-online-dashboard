import React, { useEffect, useState } from "react";
import "./style.css";
import logo from "./atlasonline.jpg";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";

export default function ExcelReader() {
  const [fileNameParts, setFileNameParts] = useState([]);
  const [typeReg, setTypeReg] = useState("");
  const [isEmailFileValid, setIsEmailFileValid] = useState(false);
  const [isSmsFileValid, setIsSmsFileValid] = useState(false);
  const [passagers, setPassagers] = useState([]);

  const navigate = useNavigate();

  

  // Fonction pour charger le fichier principal
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fullName = file.name;
    const parts = fullName.split(/[-]/);
    const selectedParts = parts.slice(2, 5);
    setFileNameParts(selectedParts);

    // Lire le contenu du fichier Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];

      const pnrIndex = headers.findIndex((header) => header.includes("PNR"));
      const paxFirstIndices = headers
        .map((header, index) => (header.includes("Pax_First") ? index : -1))
        .filter((index) => index !== -1);
      const paxLastIndices = headers
        .map((header, index) => (header.includes("Pax_Last") ? index : -1))
        .filter((index) => index !== -1);

      if (pnrIndex === -1 || paxFirstIndices.length === 0 || paxLastIndices.length === 0) {
        alert("Les colonnes PNR, Pax_First, Pax_Last sont manquantes.");
        return;
      }

      const extractedPassengers = [];

      jsonData.slice(1).forEach((row) => {
        const pnr = row[pnrIndex];
        paxFirstIndices.forEach((firstIndex, i) => {
          const firstName = row[firstIndex];
          const lastName = row[paxLastIndices[i]];
          if (firstName && lastName) {
            extractedPassengers.push({ pnr, nomcomplet: `${firstName} ${lastName}` });
          }
        });
      });


      setPassagers(extractedPassengers);
    };
    reader.readAsArrayBuffer(file);

    setIsEmailFileValid(false);
    setIsSmsFileValid(false);
  };

  // Vérifier si le fichier correspond au fichier principal
  const validateFileByName = (file) => {
    const fullName = file.name;
    const parts = fullName.split(/[-]/);
    const selectedParts = parts.slice(0, 3);

    const matchingParts = selectedParts.filter((part) => fileNameParts.includes(part));
    return matchingParts.length >= 2;
  };

  // Lire et analyser le contenu du fichier pour identifier Email ou SMS
  const validateFileByContent = (file, type) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
      const headers = jsonData[0];
      const dataColumnIndex = headers.indexOf("Contact Details Used");
      const contactIndex = headers.findIndex((header) => header.includes("PNR"));
      const statusIndex = headers.findIndex((header) => header.includes("Status Name"));
  
      if (dataColumnIndex === -1 || contactIndex === -1 || statusIndex === -1) {
        alert("Le fichier ne contient pas les colonnes correspondantes.");
        return;
      }
  
      const updatedPassagers = [...passagers];
      let alertShown=false
  
      jsonData.slice(1).forEach((row) => {
        const pnr = row[contactIndex];
        const status = row[statusIndex];
        const contact = row[dataColumnIndex];
  
        if (!pnr || !contact) return;
  
        const isEmail = typeof contact === "string" && contact.includes("@");
        const isSms = !isEmail;
        const statutFinal = status === "Delivered" || status === "Sent" ? "Envoyé" : "Non envoyé";  // Le statut par défaut est "Non envoyé"
  
        // Parcourir tous les passagers pour vérifier ceux ayant le même PNR
        updatedPassagers.forEach((passager) => {
          if (passager.pnr === pnr) {
            if (isEmail && type === "email") {
              // Si c'est un email, on met à jour le statut de l'email
              if (!passager.Statut_Email || passager.Statut_Email === "Non envoyé") {
                passager.Statut_Email = statutFinal;
              }
              setIsEmailFileValid(true);
            } else if (isSms && type === "sms") {
              // Si c'est un SMS, on met à jour le statut du SMS
              if (!passager.Statut_SMS || passager.Statut_SMS === "Non envoyé") {
                passager.Statut_SMS = statutFinal;
              }
              setIsSmsFileValid(true);
            } else {
              if(!alertShown){
                alert(`Le fichier ne correspond pas à ${type} !`);
                alertShown=true
              }}
          }
        });
      });
  
      
      setPassagers(updatedPassagers); // Mise à jour de l'état avec les passagers modifiés
    };
  };

  const handleExtraFileUpload = (event, type) => {
    const file = event.target.files[0];

    if (file) {
      if (!validateFileByName(file)) {
        alert("Le fichier ne correspond pas au fichier principal !");
        return;
      }

      validateFileByContent(file, type);
    }
  };

  const envoyerDonnees = () => {

    // verfication de linsertion d'au moins de fichiers
    const fichiersCharges=[isEmailFileValid,isSmsFileValid].filter(Boolean).length
    if(fichiersCharges<1){
      alert("Vous devez charger au moins un fichier supplementaire (SMS ou Email) avec le fichier principal")
      return;
    }

    //alert de confirmation avec type des files
    let message="Voulez-vouz ajouter: \n- fichier principal";
    if(isEmailFileValid) message+="\n- Fichier Email";
    if(isSmsFileValid) message+="\n- Fichier SMS "

    if(!window.confirm(message)){
      return
    }

    // Récupérer l'utilisateur connecté depuis la sessionStorage
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const agentmatricule = currentUser ?currentUser.matricule : "Agent inconnu";
  
    const data = {
      datevol: fileNameParts[0],
      numvol: fileNameParts[1],
      parcours: fileNameParts[2],
      typeReg: typeReg,
      passagers: passagers,
      agent: agentmatricule, // Ajouter le matricule de l'agent
    };

    
  
    axios
      .post("http://localhost:5000/api/ajouterVol", data)
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi:", error);
        alert("Erreur lors de l'envoi des données");
      });
  };

  return (
    <div className="container">
      <header className="header">
        <img src={logo} className="logo" alt="Logo" />
      </header>
      
      {/* Bouton pour charger le fichier principal */}
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />

      {fileNameParts.length > 0 && (
        <div className="line">
          {fileNameParts.map((part, index) => (
            <div key={index}>
              <input type="text" value={part} readOnly className="chunk-input" />
            </div>
          ))}

          {/* Sélecteur Type de Régularité */}
          <select value={typeReg} onChange={(e) => setTypeReg(e.target.value)} className="reg-select">
            <option value="">Sélectionnez un type de irrégularité</option>
            <option value="Affrètement">Affrètement</option>
            <option value="Annulation">Annulation</option>
            <option value="Changement d'appareil">Changement d'appareil</option>
            <option value="Changement d'horaire">Changement d'horaire</option>
            <option value="Changement de terminal">Changement de terminal</option>
            <option value="Fiabilisation">Fiabilisation</option>
            <option value="surbook">surbook</option>
            
          </select>
        </div>
      )}

      {/* Boutons pour charger les fichiers supplémentaires */}
      {fileNameParts.length > 0 && (
        <div className="extra-files">
          <label htmlFor="sms">SMS</label>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(event) => handleExtraFileUpload(event,"sms")}
          />
          {isSmsFileValid && <span className="valid-file">✔ Fichier accepté</span>}
          <label htmlFor="email">Email</label>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={(event) => handleExtraFileUpload(event,"email")}
          />
          {isEmailFileValid && <span className="valid-file">✔ Fichier accepté</span>}
        </div>
      )}

      <button onClick={envoyerDonnees} className="Enreg-button">Enregistrer</button>
    </div>
  );
}