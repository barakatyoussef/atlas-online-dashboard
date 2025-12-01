import { Navigate } from "react-router-dom";

export default function AdminRoutes({children}){
    const currentUser=JSON.parse(sessionStorage.getItem("currentUser"))
    return  currentUser && currentUser.role==='admin' ? children : <Navigate to="/"/>
}