export interface AlephiumTransaction {
  hash: string;
  blockHash: string;
  timestamp: number;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  gasAmount: number;
  gasPrice: string;
  scriptExecutionOk?: boolean;
}

export interface TransactionInput {
  outputRef: {
    hint: number;
    key: string;
  };
  unlockScript: string;
  txHashRef: string;
  address?: string;
  attoAlphAmount?: string;
}

export interface TransactionOutput {
  type: string;
  hint: number;
  key: string;
  attoAlphAmount: string;
  address: string;
  tokens?: Token[];
  lockTime?: number;
  message?: string;
}

export interface Token {
  id: string;
  amount: string;
}

export interface AddressTransaction {
  hash: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  amount: string;
  fromAddress: string;
  toAddress: string;
  confirmations?: number;
  fee?: string;
}

export interface AddressBalance {
  balance: string;
  lockedBalance: string;
  utxoNum: number;
}

export interface TransactionDetails extends AlephiumTransaction {
  confirmations: number;
  fromAddresses: string[];
  toAddresses: string[];
  totalAmount: string;
}

export interface FilterOptions {
  maxDepth: number;
  transactionLimit: number;
  minAmount: string;
  dateFrom?: Date;
  dateTo?: Date;
  showIncoming: boolean;
  showOutgoing: boolean;
}

export enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
}

