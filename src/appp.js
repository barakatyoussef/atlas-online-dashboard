import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import UserLogin from "./loginuser";
import ExcelReader from "./Formulaire";
import PrivateRoute from "./PrivateRoute";
import Acc from "./acceuil";
import AdminRoutes from "./AdminRoutes";
import GestionUsers from "./gestionusers";
import Deconnexion from "./delogin";

export default function Application() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("currentUser"));
    const [key,setKey]=useState(0)


    // Fonction pour modifier l'état de connexion et stocker dans localStorage
    const setAuth = (status) => {
        if (status) {
            sessionStorage.setItem("currentUser", "true");
        } else {
            sessionStorage.removeItem("currentUser");
        }
        setIsAuthenticated(status);
        setKey((prev)=>prev+1)
    };

    return (
        <>
            {isAuthenticated && (
                <header className="headeer">
                <nav className="nav">
                    <NavLink to="/acceuil" className="link">Accueil</NavLink>
                    <NavLink to="/Formulaire" className="link">Formulaire</NavLink>
                    
                    {/* Vérifier si l'utilisateur est admin avant d'afficher "Gestion Users" */}
                    {(() => {
                        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
                        return currentUser.role === "admin" ? (
                            <NavLink to="/gestionusers" className="link">Gestion Users</NavLink>
                        ) : null;
                    })()}
            
                    <NavLink to="/delogin" className="link">Déconnexion</NavLink>
                </nav>
            </header>
            )}

            {isAuthenticated && <div className="spacer"></div>}

            <Routes>
                <Route path="/loginuser" element={<UserLogin setAuth={setAuth} />} />
                <Route path="/acceuil" element={<PrivateRoute isAuthenticated={isAuthenticated}><Acc /></PrivateRoute>} />
                <Route path="/Formulaire" element={<PrivateRoute isAuthenticated={isAuthenticated}><ExcelReader /></PrivateRoute>} />
                <Route path="/gestionusers" element={<AdminRoutes><GestionUsers/></AdminRoutes>} />
                <Route path="/delogin" element={<Deconnexion setAuth={setAuth} />} />
                <Route path="*" element={!isAuthenticated ? <Navigate to="/loginuser" /> : <Navigate to="/acceuil" />} />
            </Routes>
            <style>{`
                .headeer {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background: #0F172A;
                    padding: 15px;
                    box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
                    text-align: center;
                    z-index: 1000;
                }
                .nav {
                    display: flex;
                    justify-content: center;
                    gap: 25px;
                }
                .link {
                    color: white;
                    text-decoration: none;
                    font-size: 18px;
                    font-weight: 500;
                    transition: color 0.3s, transform 0.2s;
                    padding-bottom: 5px;
                }
                .link:hover {
                    color: #67E8F9;
                    transform: scale(1.1);
                }
                .link.active {
                    color: #38BDF8;
                    font-weight: bold;
                    border-bottom: 2px solid #38BDF8;
                }
                .spacer {
                    height: 60px;
                }
            `}
           </style>
        </>
    );
}