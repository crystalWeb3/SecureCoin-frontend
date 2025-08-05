import { ethers } from 'ethers';
import { NETWORK_CONFIG } from './contracts';

export interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
}

export class WalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<WalletInfo> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      console.log('Connecting to wallet...');
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      console.log('Wallet address:', address);
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      console.log('Current network chainId:', network.chainId);
      console.log('Expected chainId:', NETWORK_CONFIG.chainId);
      
      if (network.chainId !== NETWORK_CONFIG.chainId) {
        console.log('Switching to BSC Testnet...');
        await this.switchToBSC();
        
        // Verify network switch
        const newNetwork = await this.provider.getNetwork();
        console.log('Network after switch:', newNetwork.chainId);
      }

      // Get balance with error handling
      let balance;
      try {
        balance = await this.provider.getBalance(address);
        console.log('Balance fetched successfully');
      } catch (error) {
        console.warn('Could not fetch balance due to RPC error:', error);
        // Set a default balance if RPC fails
        balance = ethers.BigNumber.from(0);
      }

      return {
        address,
        balance: ethers.utils.formatEther(balance),
        isConnected: true
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async switchToBSC(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.chainName,
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.explorer],
          }],
        });
      } else {
        throw switchError;
      }
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.provider || !this.signer) {
      return null;
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      return {
        address,
        balance: ethers.utils.formatEther(balance),
        isConnected: true
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return null;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }
}

// Global wallet service instance
export const walletService = new WalletService(); 