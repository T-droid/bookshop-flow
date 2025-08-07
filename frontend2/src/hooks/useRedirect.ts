import { useEffect, useCallback } from "react";

export default function useRedirect(
    isAuthenticated: boolean, 
    userRole: string, 
    navigate: (path: string) => void,
    currentPath?: string // Optional: to avoid unnecessary redirects
) {
    const handleRedirect = useCallback(() => {
        if (!isAuthenticated) {
            // Optionally redirect to login if not authenticated
            // navigate("/login");
            return;
        }

        // Avoid redirecting if already on the correct page
        const targetPath = getTargetPath(userRole);
        if (currentPath && currentPath === targetPath) {
            return;
        }

        console.log("User is authenticated with role:", userRole);
        navigate(targetPath);
    }, [isAuthenticated, userRole, navigate, currentPath]);

    const getTargetPath = (role: string): string => {
        switch (role) {
            case "superadmin":
                return "/dashboard/super-admin";
            case "admin":
            case "manager":
                return "/dashboard";
            default:
                return "/";
        }
    };

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    return null;
}