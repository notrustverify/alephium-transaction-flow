import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import {
  CompareArrows,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { formatAlphAmount } from '../../utils';
import { AddressTransaction } from '../../types';

interface StatisticsProps {
  transactions: AddressTransaction[];
  balance: string;
  address: string;
}

const Statistics: React.FC<StatisticsProps> = ({ transactions, balance }) => {
  const incomingTransactions = transactions.filter((tx) => tx.type === 'incoming');
  const outgoingTransactions = transactions.filter((tx) => tx.type === 'outgoing');

  const totalIncoming = incomingTransactions.reduce(
    (sum, tx) => sum + BigInt(tx.amount),
    BigInt(0)
  );

  const totalOutgoing = outgoingTransactions.reduce(
    (sum, tx) => sum + BigInt(tx.amount),
    BigInt(0)
  );

  const netFlow = totalIncoming - totalOutgoing;

  const stats = [
    {
      label: 'Current Balance',
      value: formatAlphAmount(balance, 4),
      icon: <AccountBalanceWallet />,
      color: 'primary',
    },
    {
      label: 'Total Inflows',
      value: formatAlphAmount(totalIncoming.toString(), 4),
      icon: <CompareArrows />,
      color: 'success',
      count: incomingTransactions.length,
    },
    {
      label: 'Total Outflows',
      value: formatAlphAmount(totalOutgoing.toString(), 4),
      icon: <CompareArrows />,
      color: 'warning',
      count: outgoingTransactions.length,
    },
    {
      label: 'Net Flow',
      value: formatAlphAmount(netFlow.toString(), 4),
      icon: <CompareArrows />,
      color: netFlow >= 0 ? 'success' : 'error',
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Statistics Overview
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: `${stat.color}.50`,
              border: '1px solid',
              borderColor: `${stat.color}.200`,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box sx={{ color: `${stat.color}.main` }}>{stat.icon}</Box>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold">
              {stat.value} ALPH
            </Typography>
            {stat.count !== undefined && (
              <Chip
                label={`${stat.count} tx`}
                size="small"
                sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
              />
            )}
          </Box>
        ))}
      </Box>

      <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Total Transactions: {transactions.length}
        </Typography>
        {transactions.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Showing latest {transactions.length} transactions
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Statistics;

