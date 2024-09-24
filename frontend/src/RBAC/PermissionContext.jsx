import React, {createContext, useContext, useState, useEffect} from "react";
import { getUserPermissions } from "./authService";
import UserData from "../views/plugin/userData";

// 創建一個Context 用於權限
const PermissionContext = createContext()

// 創建一個Provider組件，用於包裹應用並提供權限信息
export const PermissProvider = ({ children}) => {
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const userPermissions = await getUserPermissions();
            setPermissions(userPermissions);
        } catch (error) {
            console.error("Error fetching user permissions", error);
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);
    return (
        <PermissionContext.Provider value={{permissions, loading, fetchPermissions}}>
            {children}
        </PermissionContext.Provider>
    )
}

// 自定義hook用於方便訪問權限上下文
export const usePermissions = () => useContext(PermissionContext)
