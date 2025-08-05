'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getPaymentContract, getUSDTContract, CONTRACT_ADDRESSES } from '../lib/contracts';
import { ethers } from 'ethers';

interface TransactionPanelProps {
  isWalletConnected: boolean;
  walletAddress: string;
}

export default function TransactionPanel({ isWalletConnected, walletAddress }: TransactionPanelProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    hash: string;
    status: 'pending' | 'success' | 'failed';
    message?: string;
  } | null>(null);

  const handleDepositBNB = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionStatus(null);

    try {
      const paymentContract = getPaymentContract();
      if (!paymentContract) throw new Error('Contract not available');

      const amountWei = ethers.utils.parseEther(amount);
      const tx = await paymentContract.depositBNB({ value: amountWei });
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'pending',
        message: 'Depositing BNB...'
      });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'success',
        message: 'BNB deposited successfully!'
      });

      setAmount('');
    } catch (error: any) {
      setTransactionStatus({
        hash: '',
        status: 'failed',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawBNB = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionStatus(null);

    try {
      const paymentContract = getPaymentContract();
      if (!paymentContract) throw new Error('Contract not available');

      const amountWei = ethers.utils.parseEther(amount);
      const tx = await paymentContract.withdrawBNB(amountWei);
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'pending',
        message: 'Withdrawing BNB...'
      });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'success',
        message: 'BNB withdrawn successfully!'
      });

      setAmount('');
    } catch (error: any) {
      setTransactionStatus({
        hash: '',
        status: 'failed',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUSDT = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionStatus(null);

    try {
      const usdtContract = getUSDTContract();
      if (!usdtContract) throw new Error('USDT contract not available');

      const amountWei = ethers.utils.parseUnits(amount, 6); // USDT has 6 decimals
      const tx = await usdtContract.approve(CONTRACT_ADDRESSES.paymentContract, amountWei);
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'pending',
        message: 'Approving USDT...'
      });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'success',
        message: 'USDT approved successfully!'
      });

      setAmount('');
    } catch (error: any) {
      setTransactionStatus({
        hash: '',
        status: 'failed',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferUSDT = async () => {
    if (!amount || parseFloat(amount) <= 0 || !recipient) {
      alert('Please enter valid amount and recipient address');
      return;
    }

    setIsLoading(true);
    setTransactionStatus(null);

    try {
      const paymentContract = getPaymentContract();
      if (!paymentContract) throw new Error('Contract not available');

      const amountWei = ethers.utils.parseUnits(amount, 6); // USDT has 6 decimals
      const tx = await paymentContract.transferUSDT(recipient, amountWei);
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'pending',
        message: 'Transferring USDT...'
      });

      const receipt = await tx.wait();
      
      setTransactionStatus({
        hash: tx.hash,
        status: 'success',
        message: 'USDT transferred successfully!'
      });

      setAmount('');
      setRecipient('');
    } catch (error: any) {
      setTransactionStatus({
        hash: '',
        status: 'failed',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* BNB Operations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">BNB Operations</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (BNB)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isWalletConnected || isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDepositBNB}
              disabled={!isWalletConnected || isLoading || !amount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Deposit BNB
            </button>

            <button
              onClick={handleWithdrawBNB}
              disabled={!isWalletConnected || isLoading || !amount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Withdraw BNB
            </button>
          </div>
        </div>
      </div>

      {/* USDT Operations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">USDT Operations</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isWalletConnected || isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address (for transfer)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isWalletConnected || isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApproveUSDT}
              disabled={!isWalletConnected || isLoading || !amount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Approve USDT
            </button>

            <button
              onClick={handleTransferUSDT}
              disabled={!isWalletConnected || isLoading || !amount || !recipient}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Transfer USDT
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {transactionStatus && (
        <div className={`p-4 rounded-lg border ${getStatusColor(transactionStatus.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{transactionStatus.message}</p>
              {transactionStatus.hash && (
                <p className="text-sm mt-1">
                  Hash: {transactionStatus.hash.slice(0, 10)}...{transactionStatus.hash.slice(-8)}
                </p>
              )}
            </div>
            <button
              onClick={() => setTransactionStatus(null)}
              className="text-sm hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 