import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "./atlasonline.jpg";
import { useNavigate } from "react-router-dom";


export default function UserLogin({setAuth}) {
    const [user, setUser] = useState({
        matricule:"",
        passWord: "",
    })

    

    const navigate=useNavigate()
    const [errorMessage,setErrorMessage]=useState("")

    const getValues = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const validate = () => {
        setAuth(true)
        if (user.passWord.trim() !== "" && user.matricule !== "") {
            // Envoyer les données à l'API pour vérification ou ajout
            axios.post("http://localhost:5000/api/login", user)
                .then((response) => {
                    alert(response.data.message);
                    sessionStorage.setItem("currentUser", JSON.stringify(response.data.user));
                    navigate("/gestionusers");
                    window.location.reload()
                })
                .catch((error) => {
                    setErrorMessage(error.response?.data?.message || "Erreur lors de l'authentification");
                });
        } else {
            alert("Remplir tous les champs svp");
        }
    };

    return (
        <div className="form-container">
            <div className="header">
                <img src={logo} className="logo" />
            </div>
            <h1>Bienvenue a la page d'authentification</h1>
            <div className="input-group">
                <label>Matricule:</label>
                <input type="text" name="matricule" placeholder="matricule" value={user.matricule} onChange={getValues} />
                
                <label>Mot de passe:</label>
                <input type="password" name="passWord" placeholder="Mot de passe" value={user.passWord} onChange={getValues} />
    
            </div>
            {errorMessage &&<p className="error-message">{errorMessage}</p>}
            <button onClick={validate} className="validate-button">Valider</button>
        </div>
    );
}