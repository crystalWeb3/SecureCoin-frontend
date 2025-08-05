import { ethers } from 'ethers';

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  paymentContract: '0x9b35D27FC8E4042a5f8d07428b3dA9A62440B906',
  usdtToken: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  admin: '0x754Cda8029484677F63016b979ed3107056Ef008'
};

// Contract ABIs (matching the actual smart contract)
export const PAYMENT_CONTRACT_ABI = [
  // View functions
  "function getAdmin() view returns (address)",
  "function getUSDTToken() view returns (address)",
  "function getTotalDepositedBNB() view returns (uint256)",
  "function getUserBNBBalance(address user) view returns (uint256)",
  "function getContractBalance() view returns (uint256)",
  
  // State changing functions
  "function depositBNB() payable",
  "function withdrawBNB(uint256 amount)",
  "function chargeUSDT(address user, uint256 amount)",
  "function chargeBNB(address user, uint256 amount)",
  "function updateUSDTToken(address newTokenAddress)",
  "function transferAdmin(address newAdmin)",
  "function recoverToken(address token, uint256 amount)"
];

export const USDT_TOKEN_ABI = [
  // View functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // State changing functions
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 97, // BSC Testnet
  chainName: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
  fallbackRpcUrls: [
    'https://data-seed-prebsc-1-s1.binance.org:8545/',
    'https://data-seed-prebsc-2-s1.binance.org:8545/',
    'https://bsc-testnet.public.blastapi.io'
  ],
  explorer: 'https://testnet.bscscan.com/',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18
  }
};

// Helper function to get contract instance
export const getContract = (address: string, abi: any[], signer?: ethers.Signer) => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signerOrProvider = signer || provider.getSigner();
    return new ethers.Contract(address, abi, signerOrProvider);
  }
  return null;
};

// Helper function to get payment contract
export const getPaymentContract = (signer?: ethers.Signer) => {
  return getContract(CONTRACT_ADDRESSES.paymentContract, PAYMENT_CONTRACT_ABI, signer);
};

// Helper function to get USDT token contract
export const getUSDTContract = (signer?: ethers.Signer) => {
  return getContract(CONTRACT_ADDRESSES.usdtToken, USDT_TOKEN_ABI, signer);
}; 