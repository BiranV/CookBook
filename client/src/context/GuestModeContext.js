import { createContext, useContext, useState } from 'react';

const GuestModeContext = createContext();


export const GuestModeProvider = ({ children }) => {
    const [guestMode, setGuestMode] = useState(false);

    return (
        <GuestModeContext.Provider value={{ guestMode, setGuestMode }}>
            {children}
        </GuestModeContext.Provider>
    );
};

export const useGuestMode = () => useContext(GuestModeContext);