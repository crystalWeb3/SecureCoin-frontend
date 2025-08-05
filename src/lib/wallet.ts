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
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      const account = accounts[0];
      
      if (!account) {
        throw new Error('No account selected');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      await this.switchToBSC();
      
      const balance = await this.getBalance(account);
      
      return {
        address: account,
        balance,
        isConnected: true
      };
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async switchToBSC(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to BSC Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }]
      });
    } catch (error: unknown) {
      console.error('Error switching to BSC:', error);
      
      // If the network doesn't exist, add it
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as { code: number }).code;
        if (errorCode === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.chainName,
                nativeCurrency: {
                  name: NETWORK_CONFIG.nativeCurrency.name,
                  symbol: NETWORK_CONFIG.nativeCurrency.symbol,
                  decimals: NETWORK_CONFIG.nativeCurrency.decimals,
                },
                rpcUrls: [NETWORK_CONFIG.rpcUrl, ...NETWORK_CONFIG.fallbackRpcUrls],
                blockExplorerUrls: [NETWORK_CONFIG.explorer],
              }]
            });
          } catch (addError) {
            console.error('Error adding BSC network:', addError);
            throw new Error('Failed to add BSC Testnet to wallet');
          }
        } else {
          throw new Error('Failed to switch to BSC Testnet');
        }
      } else {
        throw new Error('Failed to switch to BSC Testnet');
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

  async getBalance(address: string): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not available');
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error: unknown) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }
}

// Global wallet service instance
export const walletService = new WalletService(); 