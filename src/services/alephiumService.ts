import {
  NodeProvider,
  isValidAddress,
  web3,
  contractIdFromAddress,
} from '@alephium/web3';
import {
  AlephiumTransaction,
  AddressTransaction,
  AddressBalance,
  NetworkType,
} from '../types';

const NETWORK_URLS = {
  [NetworkType.MAINNET]: 'https://backend.mainnet.alephium.org',
  [NetworkType.TESTNET]: 'https://backend.testnet.alephium.org',
  [NetworkType.DEVNET]: 'http://localhost:22973',
};

class AlephiumService {
  private nodeProvider: NodeProvider;
  private network: NetworkType;

  constructor(network: NetworkType = NetworkType.MAINNET) {
    this.network = network;
    this.nodeProvider = new NodeProvider(NETWORK_URLS[network]);
    web3.setCurrentNodeProvider(this.nodeProvider);
  }

  setNetwork(network: NetworkType): void {
    this.network = network;
    this.nodeProvider = new NodeProvider(NETWORK_URLS[network]);
    web3.setCurrentNodeProvider(this.nodeProvider);
  }

  getNetwork(): NetworkType {
    return this.network;
  }

  validateAddress(address: string): boolean {
    try {
      return isValidAddress(address);
    } catch {
      return false;
    }
  }

  isContractAddress(address: string): boolean {
    try {
      // Use @alephium/web3 to check if it's a contract address
      // Try to get contract ID from address - if it succeeds, it's a contract
      contractIdFromAddress(address);
      return true;
    } catch {
      // If conversion fails, it's a regular address
      return false;
    }
  }

  async getContractInfo(address: string): Promise<{ isContract: boolean; name?: string } | null> {
    try {
      // First check if it's a contract address using SDK
      if (!this.isContractAddress(address)) {
        return { isContract: false };
      }

      // Try to fetch contract state from the backend
      const response = await fetch(
        `${NETWORK_URLS[this.network]}/contracts/${address}`
      );
      
      if (response.ok) {
        const contractData = await response.json();
        return {
          isContract: true,
          name: contractData?.bytecode ? 'Smart Contract' : undefined,
        };
      }
      
      // Even if API fails, we know it's a contract from the address format
      return { isContract: true };
    } catch (error) {
      return { isContract: false };
    }
  }

  async getAddressBalance(address: string): Promise<AddressBalance> {
    try {
      const balance = await this.nodeProvider.addresses.getAddressesAddressBalance(
        address
      );
      return {
        balance: balance.balance,
        lockedBalance: balance.lockedBalance,
        utxoNum: balance.utxoNum,
      };
    } catch (error) {
      console.error('Error fetching address balance:', error);
      throw new Error('Failed to fetch address balance');
    }
  }

  async getAddressTransactions(
    address: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    transactions: AddressTransaction[];
    total: number;
  }> {
    try {
      // Use the explorer backend API
      // API returns transactions directly as an array
      const baseUrl = NETWORK_URLS[this.network];
      const response = await fetch(
        `${baseUrl}/addresses/${address}/transactions?page=${page}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      // API returns array of transactions directly
      const txs = await response.json();

      const transactions: AddressTransaction[] = [];

      for (const tx of txs) {
        // Check if this address is in inputs (sender) or outputs (receiver)
        const isIncoming = tx.outputs?.some((output: any) => output.address === address);
        const isOutgoing = tx.inputs?.some((input: any) => input.address === address);

        // Calculate the amount for this address
        let amount = '0';
        
        if (isIncoming && !isOutgoing) {
          // Pure incoming: sum all outputs to this address
          const incomingAmount = tx.outputs
            ?.filter((output: any) => output.address === address)
            .reduce((sum: bigint, output: any) => sum + BigInt(output.attoAlphAmount || '0'), BigInt(0));
          amount = incomingAmount?.toString() || '0';
        } else if (isOutgoing && !isIncoming) {
          // Pure outgoing: sum all outputs NOT to this address (sent away)
          const outgoingAmount = tx.outputs
            ?.filter((output: any) => output.address !== address)
            .reduce((sum: bigint, output: any) => sum + BigInt(output.attoAlphAmount || '0'), BigInt(0));
          amount = outgoingAmount?.toString() || '0';
        } else if (isIncoming && isOutgoing) {
          // Self-transaction: calculate net change
          const totalIn = tx.outputs
            ?.filter((output: any) => output.address === address)
            .reduce((sum: bigint, output: any) => sum + BigInt(output.attoAlphAmount || '0'), BigInt(0)) || BigInt(0);
          const totalOut = tx.inputs
            ?.filter((input: any) => input.address === address)
            .reduce((sum: bigint, input: any) => sum + BigInt(input.attoAlphAmount || '0'), BigInt(0)) || BigInt(0);
          amount = (totalIn - totalOut).toString();
        }

        // Determine primary sender and receiver
        // Find first input and output with different addresses
        const fromAddress = tx.inputs?.[0]?.address || 'Unknown';
        const toAddress = tx.outputs?.[0]?.address || 'Unknown';

        transactions.push({
          hash: tx.hash,
          timestamp: tx.timestamp,
          type: isIncoming && !isOutgoing ? 'incoming' : 'outgoing',
          amount: amount === '0' ? '1000000000000000000' : amount, // Default to 1 ALPH if amount is 0
          fromAddress,
          toAddress,
        });
      }

      return {
        transactions,
        total: txs.length,
      };
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      throw new Error('Failed to fetch address transactions');
    }
  }

  async getTransactionDetails(txHash: string): Promise<AlephiumTransaction> {
    try {
      // Use the explorer backend API instead
      const baseUrl = NETWORK_URLS[this.network];
      const response = await fetch(`${baseUrl}/transactions/${txHash}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }
      
      const tx = await response.json();
      return tx as AlephiumTransaction;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  async getConnectedAddresses(
    address: string,
    limit: number = 50
  ): Promise<Map<string, { count: number; totalAmount: string; type: 'incoming' | 'outgoing' }>> {
    try {
      const { transactions } = await this.getAddressTransactions(address, 1, limit);
      const connectedAddresses = new Map<
        string,
        { count: number; totalAmount: string; type: 'incoming' | 'outgoing' }
      >();

      for (const tx of transactions) {
        const otherAddress = tx.type === 'incoming' ? tx.fromAddress : tx.toAddress;
        
        if (otherAddress === address || otherAddress === 'Unknown') continue;

        const existing = connectedAddresses.get(otherAddress);
        if (existing) {
          existing.count += 1;
          existing.totalAmount = (
            BigInt(existing.totalAmount) + BigInt(tx.amount)
          ).toString();
        } else {
          connectedAddresses.set(otherAddress, {
            count: 1,
            totalAmount: tx.amount,
            type: tx.type,
          });
        }
      }

      return connectedAddresses;
    } catch (error) {
      console.error('Error fetching connected addresses:', error);
      throw new Error('Failed to fetch connected addresses');
    }
  }

  async getCurrentHeight(): Promise<number> {
    try {
      const chainInfo = await this.nodeProvider.infos.getInfosChainParams();
      return chainInfo.networkId;
    } catch (error) {
      console.error('Error fetching current height:', error);
      return 0;
    }
  }

  formatAlphAmount(attoAlph: string, decimals: number = 4): string {
    const alph = Number(BigInt(attoAlph)) / 1e18;
    return alph.toFixed(decimals);
  }

  convertAlphToAtto(alph: string): string {
    return (BigInt(Math.floor(Number(alph) * 1e18))).toString();
  }
}

export default AlephiumService;
export const alephiumService = new AlephiumService();

