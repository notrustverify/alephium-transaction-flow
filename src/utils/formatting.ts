import { formatDistanceToNow, format } from 'date-fns';

export const formatAlphAmount = (attoAlph: string, decimals: number = 4): string => {
  try {
    const alph = Number(BigInt(attoAlph)) / 1e18;
    return formatNumberWithSuffix(alph, decimals);
  } catch {
    return '0';
  }
};

export const formatNumberWithSuffix = (num: number, decimals: number = 2): string => {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

export const formatTimestamp = (timestamp: number): string => {
  try {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (timestamp: number): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

export const formatTransactionHash = (hash: string, chars: number = 8): string => {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
};

export const getExplorerUrl = (hash: string, network: string): string => {
  const baseUrls: Record<string, string> = {
    mainnet: 'https://explorer.alephium.org',
    testnet: 'https://testnet.alephium.org',
    devnet: 'http://localhost:23000',
  };
  
  const baseUrl = baseUrls[network] || baseUrls.mainnet;
  return `${baseUrl}/transactions/${hash}`;
};

export const getAddressExplorerUrl = (address: string, network: string): string => {
  const baseUrls: Record<string, string> = {
    mainnet: 'https://explorer.alephium.org',
    testnet: 'https://testnet.alephium.org',
    devnet: 'http://localhost:23000',
  };
  
  const baseUrl = baseUrls[network] || baseUrls.mainnet;
  return `${baseUrl}/addresses/${address}`;
};

