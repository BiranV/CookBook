import { jwtDecode } from "jwt-decode";

export const getUserEmailFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.email;
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }
    return null;
};