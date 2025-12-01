import React, { useEffect, useState } from "react"
import axios from "axios"

import "./style.css";
import logo from "./atlasonline.jpg";

export default function GestionUsers(){

    const [newUser,setNewUser]=useState({
        nom:"",
        prenom:"",
        passWord:"",
        matricule:"",
        role:""
    })

    const [users,setUsers]=useState([])

    useEffect(()=>{
        axios.get("http://localhost:5000/api/users")
             .then(response=>setUsers(response.data))

    },[])

    const handleChange=(e,id)=>{
        const {name,value}=e.target
        setUsers(users.map(user=>user.id === id ? {...user,[name]:value} : user))
    }

    const handleInputChange=(e)=>{
        setNewUser({
            ...newUser,
            [e.target.name]:e.target.value
        })
    }

    const handleUpdate=(id)=>{
        const user=users.find(user=>user.id === id)
        axios.put(`http://localhost:5000/api/users/${id}`,user)
             .then(response=>alert("Utilisateur mise a jour avec succes "))
             .catch(error=>{
                console.error("Axios Error:",error.response);
                alert(error.response?.data?.message || "Erreur lors de la mise a jour");
            })
    }

    const handleDelete=(id)=>{
        const Utilisateur=users.find(user=>user.id === id)
        axios.delete(`http://localhost:5000/api/supprimerUser/${id}`,Utilisateur)
             .then(response=>alert("Utilisateur supprime avec succes"))
             .catch(error=>console.error("Erreur de suppression:",error))
        

    }
    const handleAddUser = () => {
        if (!newUser.nom || !newUser.prenom || !newUser.passWord || !newUser.matricule || !newUser.role) {
            alert("Tous les champs sont requis !");
            return;
        }

        axios.post("http://localhost:5000/api/add-user", newUser)
            .then((response) => {
                alert(response.data.message);
                setNewUser({ nom: "", prenom: "",passWord:"",matricule: "",  role: "" }); // Réinitialiser le formulaire
                
            })
            .catch((error) => {
                alert(error.response?.data?.message || "Erreur lors de l'ajout");
            });
    };

    return(
        <>
        <div className="container">
            <header className="header">
                <img src={logo} className="logo" alt="Logo" />
            </header>
            <h1>Ajouter un utilisateur</h1>
            <div className="container-formulaire"> 
                <label>Nom:</label>
                <input type="text" value={newUser.nom} className="checkinput" name="nom"
                onChange={handleInputChange}/>
                <label>Prenom</label>
                <input type="text" value={newUser.prenom} className="checkinput" name="prenom"
                onChange={handleInputChange}/>
                <label>Matricule</label>
                <input type="text"value={newUser.matricule} className="checkinput" name="matricule"
                onChange={handleInputChange}/>
                <label>Password</label>
                <input type="password" value={newUser.passWord} className="checkinput" name="passWord"
                onChange={handleInputChange}/>
                <select name="role" value={newUser.role} onChange={(e)=>handleInputChange(e)}>
                        <option>slectionner un role</option>
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                </select>
                <button onClick={handleAddUser} className="addbutton">Add</button>
            </div>
            <h1>Liste des utilisateurs</h1>
            <table className="user-table">
    <thead>
        <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Rôle</th>
            <th>Matricule</th>
            <th>Mot de passe</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {users.map((user) => (
            <tr key={user.id}>
                <td>
                    <input type="text" name="nom" value={user.nom} className="checkinput"
                        onChange={(e) => handleChange(e, user.id)} />
                </td>
                <td>
                    <input type="text" name="prenom" value={user.prenom} className="checkinput"
                        onChange={(e) => handleChange(e, user.id)} />
                </td>
                <td>
                    <select name="role" value={user.role} onChange={(e) => handleChange(e, user.id)}>
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                    </select>
                </td>
                <td>
                    <input type="text" name="matricule" value={user.matricule} className="checkinput"
                        onChange={(e) => handleChange(e, user.id)} />
                </td>
                <td>
                    <input type="password" name="passWord" value={user.passWord} className="checkinput"
                        placeholder="Nouveau mot de passe" onChange={(e) => handleChange(e, user.id)} />
                </td>
                <td>
                    <button onClick={() => handleUpdate(user.id)}>Mettre à jour</button>
                    <button onClick={() => handleDelete(user.id)} className="deletebutton">Supprimer</button>
                </td>
            </tr>
        ))}
    </tbody>
</table>
        </div>
        </>
    )
}