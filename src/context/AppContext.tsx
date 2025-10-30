import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NetworkType, FilterOptions } from '../types';
import { alephiumService } from '../services/alephiumService';

interface AppContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  selectedAddress: string | null;
  setSelectedAddress: (address: string | null) => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

const defaultFilters: FilterOptions = {
  maxDepth: 2,
  transactionLimit: 50,
  minAmount: '0',
  showIncoming: true,
  showOutgoing: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<NetworkType>(NetworkType.MAINNET);
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'true'
  );
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    alephiumService.setNetwork(newNetwork);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  return (
    <AppContext.Provider
      value={{
        network,
        setNetwork,
        darkMode,
        toggleDarkMode,
        selectedAddress,
        setSelectedAddress,
        filters,
        setFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

