import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthState } from "../context/AuthContext";


export const useAuth = (): AuthState => {
    const context = useContext(AuthContext)
    
    if (!context) {
        throw new Error("AuthContext can only be used inside an Auth Provider")
    }

    return context
}