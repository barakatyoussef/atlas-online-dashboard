import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Deconnexion({setAuth}){
    const navigate=useNavigate()
    useEffect(()=>{
      sessionStorage.removeItem("currentUser");
      navigate("/loginuser");
    },[navigate])
    setAuth(false);
    
    
  };
