import { useState, useCallback } from 'react';
import { useAlephiumApi } from './useAlephiumApi';
import { transformTransactionsToGraph, applyDagreLayout } from '../utils';
import {
  CustomNode,
  CustomEdge,
  AddressTransaction,
  FilterOptions,
} from '../types';

interface UseTransactionFlowReturn {
  nodes: CustomNode[];
  edges: CustomEdge[];
  loading: boolean;
  error: string | null;
  transactions: AddressTransaction[];
  balance: string;
  fetchTransactionFlow: (address: string, filters: FilterOptions) => Promise<void>;
  refreshData: () => Promise<void>;
  clearData: () => void;
}

export const useTransactionFlow = (): UseTransactionFlowReturn => {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<CustomEdge[]>([]);
  const [transactions, setTransactions] = useState<AddressTransaction[]>([]);
  const [balance, setBalance] = useState<string>('0');
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions | null>(null);

  const { loading, error, fetchAddressBalance, fetchAddressTransactions } =
    useAlephiumApi();

  const fetchTransactionFlow = useCallback(
    async (address: string, filters: FilterOptions) => {
      setCurrentAddress(address);
      setCurrentFilters(filters);

      // Fetch balance
      const balanceData = await fetchAddressBalance(address);
      if (!balanceData) return;

      setBalance(balanceData.balance);

      // Fetch transactions with pagination (API max 100 per page)
      const pageSize = Math.min(100, Math.max(1, filters.transactionLimit));
      const desired = filters.transactionLimit;
      let page = 1;
      let allTxs: AddressTransaction[] = [];
      while (allTxs.length < desired) {
        const txPage = await fetchAddressTransactions(address, page, pageSize);
        if (!txPage) return;
        allTxs = allTxs.concat(txPage.transactions);
        if (txPage.transactions.length < pageSize) {
          break; // no more pages
        }
        page += 1;
      }

      let filteredTransactions = allTxs.slice(0, desired);

      // Apply filters
      if (filters.minAmount && filters.minAmount !== '0') {
        const minAmountBigInt = BigInt(filters.minAmount);
        filteredTransactions = filteredTransactions.filter(
          (tx) => BigInt(tx.amount) >= minAmountBigInt
        );
      }

      if (filters.dateFrom) {
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.timestamp >= filters.dateFrom!.getTime()
        );
      }

      if (filters.dateTo) {
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.timestamp <= filters.dateTo!.getTime()
        );
      }

      setTransactions(filteredTransactions);

      // Transform to graph
      const graphData = transformTransactionsToGraph(
        address,
        filteredTransactions,
        balanceData.balance,
        filters.showIncoming,
        filters.showOutgoing
      );

      // Apply layout
      const layoutedNodes = applyDagreLayout(graphData.nodes, graphData.edges);

      setNodes(layoutedNodes);
      setEdges(graphData.edges);
    },
    [fetchAddressBalance, fetchAddressTransactions]
  );

  const refreshData = useCallback(async () => {
    if (currentAddress && currentFilters) {
      await fetchTransactionFlow(currentAddress, currentFilters);
    }
  }, [currentAddress, currentFilters, fetchTransactionFlow]);

  const clearData = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setTransactions([]);
    setBalance('0');
    setCurrentAddress(null);
    setCurrentFilters(null);
  }, []);

  return {
    nodes,
    edges,
    loading,
    error,
    transactions,
    balance,
    fetchTransactionFlow,
    refreshData,
    clearData,
  };
};

