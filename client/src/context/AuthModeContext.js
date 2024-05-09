import { createContext, useContext, useState } from 'react';

const AuthModeContext = createContext();


export const AuthModeProvider = ({ children }) => {
    const [authMode, setAuthMode] = useState(false);

    return (
        <AuthModeContext.Provider value={{ authMode, setAuthMode }}>
            {children}
        </AuthModeContext.Provider>
    );
};

export const useAuthMode = () => useContext(AuthModeContext);