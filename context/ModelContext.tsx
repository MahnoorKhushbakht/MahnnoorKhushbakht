'use client';
import {createContext, useContext, useState, ReactNode} from 'react';

interface ModelContextType {
    isOpen : boolean;
    onOpen : () => void;
    onClose : () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({children} : {children : ReactNode}) => {
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    return (
        <ModelContext.Provider value={{isOpen, onOpen, onClose}}>
            {children}
        </ModelContext.Provider>
    );
}
export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (context === undefined) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
}
