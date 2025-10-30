import { alephiumService } from '../services/alephiumService';

export const validateAlephiumAddress = (address: string): boolean => {
  if (!address || address.trim().length === 0) {
    return false;
  }
  return alephiumService.validateAddress(address.trim());
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

