import { useState, useCallback } from 'react';
import { alephiumService } from '../services/alephiumService';
import {
  AddressTransaction,
  AddressBalance,
  AlephiumTransaction,
} from '../types';

interface UseAlephiumApiReturn {
  loading: boolean;
  error: string | null;
  fetchAddressBalance: (address: string) => Promise<AddressBalance | null>;
  fetchAddressTransactions: (
    address: string,
    page?: number,
    limit?: number
  ) => Promise<{ transactions: AddressTransaction[]; total: number } | null>;
  fetchTransactionDetails: (txHash: string) => Promise<AlephiumTransaction | null>;
  clearError: () => void;
}

export const useAlephiumApi = (): UseAlephiumApiReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchAddressBalance = useCallback(async (address: string): Promise<AddressBalance | null> => {
    setLoading(true);
    setError(null);
    try {
      const balance = await alephiumService.getAddressBalance(address);
      return balance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch address balance';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAddressTransactions = useCallback(
    async (
      address: string,
      page: number = 1,
      limit: number = 50
    ): Promise<{ transactions: AddressTransaction[]; total: number } | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await alephiumService.getAddressTransactions(address, page, limit);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchTransactionDetails = useCallback(
    async (txHash: string): Promise<AlephiumTransaction | null> => {
      setLoading(true);
      setError(null);
      try {
        const transaction = await alephiumService.getTransactionDetails(txHash);
        return transaction;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction details';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchAddressBalance,
    fetchAddressTransactions,
    fetchTransactionDetails,
    clearError,
  };
};

