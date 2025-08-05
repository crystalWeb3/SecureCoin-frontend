'use client';

import { useState, useEffect } from 'react';
import { WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { walletService, WalletInfo } from '../lib/wallet';

interface WalletConnectProps {
  onWalletConnected: (walletInfo: WalletInfo) => void;
  onWalletDisconnected: () => void;
}

export default function WalletConnect({ onWalletConnected, onWalletDisconnected }: WalletConnectProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const info = await walletService.getWalletInfo();
      if (info) {
        setWalletInfo(info);
        onWalletConnected(info);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const info = await walletService.connectWallet();
      setWalletInfo(info);
      onWalletConnected(info);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
      setWalletInfo(null);
      onWalletDisconnected();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  if (walletInfo) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">Connected</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-green-700">
            {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
          </p>
          <p className="text-xs text-green-600">
            Balance: {parseFloat(walletInfo.balance).toFixed(4)} BNB
          </p>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <WalletIcon className="h-5 w-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        Make sure you have MetaMask installed and are connected to BSC Testnet
      </div>
    </div>
  );
} 