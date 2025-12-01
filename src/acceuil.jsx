import { Link } from "react-router-dom";
import logo from "./atlasonline.jpg";
import "./style.css";
import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Acc() {
    const [synthese, setSynthese] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [startDate, setStartDate] = useState(""); 
    const [endDate,setEndDate]=useState("");
    const [numVol,setNumVol]=useState("");
    const [parcoursVol,setParcoursVol]=useState("");
    const [dateInsertionMin,setDateInsertionMin]=useState("")
    const [dateInsertionMax,setDateInsertioMax]=useState("")
    const [typeIrreg,setTypeIrreg]=useState("")

    // Fonction pour récupérer la synthèse avec filtrage
    const fetchSynthese = () => {
        setLoading(true);
        axios.get("http://localhost:5000/api/synthese", {
            params: { startDate, endDate,numVol,parcoursVol,dateInsertionMin,dateInsertionMax,typeIrreg }
        })
        .then((response) => {
            setSynthese(response.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Erreur récupération synthèse :", err);
            setError(true);
            setLoading(false);
        });
        
    };

    

    // Exécuter la mise à jour puis récupérer la synthèse
    useEffect(() => {
        axios.post("http://localhost:5000/api/maj-synthese")
            .then(fetchSynthese) // Récupère la synthèse après la mise à jour
            .catch((err) => console.error("Erreur mise à jour synthèse :", err));
    }, []);

    // Fonction pour exporter en Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(synthese);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Synthese_Vols");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, "synthese_vols.xlsx");
    };

    return (
        <>
            <div className="container">
                <header className="header">
                    <img src={logo} className="logo" alt="Logo" />
                </header>
                <h1> Bienvenue au Page d'Accueil</h1>

            
                <div className="filtration-container">
                <label>Start Date:</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                />
                <label>End Date</label>
                <input
                    type="date" value={endDate}
                    onChange={(e)=>setEndDate(e.target.value)}
                />
                <label>Numero de vol</label>
                <input type="text" value={numVol} name="numVol"
                onChange={(e)=>setNumVol(e.target.value)}
                />
                <label>Parcours du vol</label>
                <input type="text" value={parcoursVol} name="parcoursVol"
                onChange={(e)=>setParcoursVol(e.target.value)}
                />
                <label>Filtrer par Date d'insertion</label>
                <input type="date" value={dateInsertionMin} name="dateInsertionMin"
                onChange={(e)=>setDateInsertionMin(e.target.value)}/>
                <input type="date" value={dateInsertionMax} name="dateInsertionMax"
                onChange={(e)=>setDateInsertioMax(e.target.value)}
                />
                <select value={typeIrreg} name="typeIrreg" onChange={(e)=>setTypeIrreg(e.target.value)}>
                    <option value="">Sélectionnez un type de irrégularité</option>
                    <option value="Affrètement">Affrètement</option>
                    <option value="Annulation">Annulation</option>
                    <option value="Changement d'appareil">Changement d'appareil</option>
                    <option value="Changement d'horaire">Changement d'horaire</option>
                    <option value="Changement de terminal">Changement de terminal</option>
                    <option value="Fiabilisation">Fiabilisation</option>
                    <option value="surbook">surbook</option>
                </select>

                <button onClick={fetchSynthese}> Filtrer</button>
                </div>
                {/* Bouton pour exporter en Excel */}
                <button onClick={exportToExcel} disabled={synthese.length === 0} className="export-button">
                    Exporter en Excel
                </button>

                {loading ? <p>Chargement...</p> : (
                    <table border={1}>
                        <thead>
                            <tr>
                                <th>Date d'Insertion</th>
                                <th>Numéro de Vol</th>
                                <th>Parcours</th>
                                <th>Date du Vol</th>
                                <th>Nombre des Passagers</th>
                                <th>Nombre de SMS Envoyés</th>
                                <th>Nombre d'Emails Envoyés</th>
                                <th>agent</th>
                                <th>type irregularite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {synthese.map((vol) => (
                                <tr key={vol.id}>
                                    <td>{vol.date_insertion}</td>
                                    <td>{vol.numvol}</td>
                                    <td>{vol.parcours}</td>
                                    <td>{vol.datevol}</td>
                                    <td>{vol.nombre_passagers}</td>
                                    <td>{vol.nbre_sms}</td>
                                    <td>{vol.nbre_emails}</td>
                                    <td>{vol.agent}</td>
                                    <td>{vol.type_irreg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}