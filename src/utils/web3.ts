import { ethers } from "ethers";
import { 
  SUPPORTED_CHAINS, 
  getChainConfig, 
  getContractAddress,
  getChainAbi,
  isChainSupported,
  TEA_SEPOLIA_CHAIN_ID,
  DEPLOY_BLOCK,
  CHECKIN_FEE,
  getReferralContractAddress,
  getReferralContractAbi,
  isReferralSupported,
  BASE_CHAIN_ID
} from "./constants";

const isBrowser = typeof window !== "undefined";

export const getProvider = () => {
  if (!isBrowser) return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  
  return new ethers.providers.Web3Provider(ethereum, "any");
};

export const connectWallet = async () => {
  try {
    if (!isBrowser) throw new Error("Cannot connect wallet server-side");
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error("No Ethereum provider found. Please install MetaMask.");
    
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet");
    }
    
    const provider = new ethers.providers.Web3Provider(ethereum, "any");
    const signer = provider.getSigner();
    const address = accounts[0]; 
    
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    return { signer, address, chainId, provider };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const switchToChain = async (chainId: number) => {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error("No Ethereum provider found");
    
    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) throw new Error(`Unsupported chain ID: ${chainId}`);
    
    const standardChainConfig = {
      chainId: chainConfig.chainId,
      chainName: chainConfig.chainName,
      nativeCurrency: chainConfig.nativeCurrency,
      rpcUrls: chainConfig.rpcUrls,
      blockExplorerUrls: chainConfig.blockExplorerUrls
    };
    
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainConfig.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [standardChainConfig],
        });
      } else {
        throw switchError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error switching network:", error);
    throw error;
  }
};

export const switchToTeaSepolia = async () => {
  return switchToChain(TEA_SEPOLIA_CHAIN_ID);
};

export const getContract = (
  signerOrProvider: ethers.Signer | ethers.providers.Provider, 
  chainId: number,
) => {
  const contractAddress = getContractAddress(chainId);
  const contractAbi = getChainAbi(chainId);

  if (!contractAddress || !contractAbi) {
    throw new Error(`Konfigurasi tidak ditemukan untuk chain ID: ${chainId}`);
  }

  return new ethers.Contract(contractAddress, contractAbi, signerOrProvider);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const fullAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address}`;
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Available now";
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const format = (num: number) => num.toString().padStart(2, '0');
  
  if (days > 0) {
    return `${days}d ${format(hours)}:${format(minutes)}:${format(remainingSeconds)}`;
  } else {
    return `${format(hours)}:${format(minutes)}:${format(remainingSeconds)}`;
  }
};

export const isWalletConnected = async (): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
};

export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const provider = getProvider();
    if (!provider || !address) return "0.0";
    
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return "0.0";
  }
};

export const isSupportedNetwork = async (): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    return isChainSupported(network.chainId);
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

export const isTeaSepoliaNetwork = async (): Promise<boolean> => {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    return network.chainId === TEA_SEPOLIA_CHAIN_ID;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

export const getCurrentChainId = async (): Promise<number | null> => {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const network = await provider.getNetwork();
    return network.chainId;
  } catch (error) {
    console.error("Error getting chain ID:", error);
    return null;
  }
};

export const getTotalCheckins = async (contract: ethers.Contract): Promise<number> => {
  try {
    const provider = contract.provider;
    if (!provider) return 0;
    
    const eventSignature = ethers.utils.id("BeaconActivated(address,uint256,uint256,uint256,uint256,uint256)");
    
    const currentBlock = await provider.getBlockNumber();
    console.log(`Scanning from block ${DEPLOY_BLOCK} to ${currentBlock}`);
    
    const CHUNK_SIZE = 10000;
    let totalCount = 0;
    
    for (let fromBlock = DEPLOY_BLOCK; fromBlock <= currentBlock; fromBlock += CHUNK_SIZE) {
      const toBlock = Math.min(currentBlock, fromBlock + CHUNK_SIZE - 1);
      
      try {
        const logs = await provider.getLogs({
          address: contract.address,
          topics: [eventSignature],
          fromBlock,
          toBlock
        });
        
        totalCount += logs.length;
        console.log(`Processed blocks ${fromBlock}-${toBlock}: Found ${logs.length} events (Running total: ${totalCount})`);
      } catch (error) {
        console.warn(`Error querying logs for blocks ${fromBlock}-${toBlock}:`, error);
        
        if (CHUNK_SIZE > 1000) {
          const smallerChunkSize = CHUNK_SIZE / 5;
          
          for (let smallFromBlock = fromBlock; smallFromBlock <= toBlock; smallFromBlock += smallerChunkSize) {
            const smallToBlock = Math.min(toBlock, smallFromBlock + smallerChunkSize - 1);
            
            try {
              const smallerLogs = await provider.getLogs({
                address: contract.address,
                topics: [eventSignature],
                fromBlock: smallFromBlock,
                toBlock: smallToBlock
              });
              
              totalCount += smallerLogs.length;
              console.log(`Processed smaller chunk ${smallFromBlock}-${smallToBlock}: Found ${smallerLogs.length} events`);
            } catch (smallerError) {
              console.error(`Failed to process smaller chunk ${smallFromBlock}-${smallToBlock}:`, smallerError);
            }
          }
        }
      }
    }
    
    if (totalCount === 0) {
      try {
        const systemMetrics = await contract.getSystemMetrics();
        if (systemMetrics && systemMetrics.totalCrystalCount) {
          console.log(`No events found, using totalCrystalCount: ${systemMetrics.totalCrystalCount}`);
          return parseInt(systemMetrics.totalCrystalCount.toString());
        }
      } catch (systemError) {
        console.warn("Error getting system metrics:", systemError);
      }
    }
    
    return totalCount;
  } catch (error) {
    console.error("Error in getTotalCheckins:", error);
    return 0;
  }
};

export const performCheckin = async (
  contract: ethers.Contract, 
  chainId: number
): Promise<ethers.ContractTransaction> => {
  
    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }
    
    let currentTax;
    try {
      const systemMetrics = await contract.getSystemMetrics();
      currentTax = systemMetrics.currentTax;
    } catch (metricsError) {
      console.error("Error getting system metrics:", metricsError);
      currentTax = ethers.utils.parseEther(CHECKIN_FEE);
    }
    
    const tx = await contract.activateBeacon({
      value: currentTax
    });
    
    return tx;
};

export { isChainSupported, getChainConfig };


/**
 * Get referral contract instance
 */
export const getReferralContract = (
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  const contractAddress = getReferralContractAddress();
  const contractAbi = getReferralContractAbi();

  return new ethers.Contract(contractAddress, contractAbi, signerOrProvider);
};

/**
 * Check if current chain supports referral
 */
export const isOnReferralChain = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === BASE_CHAIN_ID;
};

/**
 * Get who referred a specific address
 */
export const getReferrer = async (
  provider: ethers.providers.Provider,
  userAddress: string
): Promise<string> => {
  try {
    const contract = getReferralContract(provider);
    const referrer = await contract.getReferrer(userAddress);
    return referrer;
  } catch (error) {
    console.error('Error getting referrer:', error);
    throw error;
  }
};

/**
 * Get total referral count for a referrer
 */
export const getReferralCount = async (
  provider: ethers.providers.Provider,
  referrerAddress: string
): Promise<number> => {
  try {
    const contract = getReferralContract(provider);
    const count = await contract.getReferralCount(referrerAddress);
    return count.toNumber();
  } catch (error) {
    console.error('Error getting referral count:', error);
    throw error;
  }
};

/**
 * Check if user has a referrer
 */
export const hasReferrer = async (
  provider: ethers.providers.Provider,
  userAddress: string
): Promise<boolean> => {
  try {
    const referrer = await getReferrer(provider, userAddress);
    return referrer !== ethers.constants.AddressZero;
  } catch (error) {
    console.error('Error checking referrer:', error);
    return false;
  }
};

/**
 * Register a referral (write transaction)
 */
export const registerReferral = async (
  signer: ethers.Signer,
  referrerAddress: string
): Promise<ethers.ContractTransaction> => {
  try {
    // Validate current chain
    const provider = signer.provider;
    if (!provider) throw new Error('Provider not found');
    
    const network = await provider.getNetwork();
    if (network.chainId !== BASE_CHAIN_ID) {
      throw new Error('Referral only available on Base network');
    }

    const contract = getReferralContract(signer);
    
    // Validate referrer address
    if (!ethers.utils.isAddress(referrerAddress)) {
      throw new Error('Invalid referrer address');
    }

    // Get user's address
    const userAddress = await signer.getAddress();
    
    // Check if trying to refer themselves
    if (referrerAddress.toLowerCase() === userAddress.toLowerCase()) {
      throw new Error('Cannot refer yourself');
    }

    // Check if already has a referrer
    const existingReferrer = await contract.getReferrer(userAddress);
    if (existingReferrer !== ethers.constants.AddressZero) {
      throw new Error('Already has a referrer');
    }

    // Execute transaction
    const tx = await contract.registerReferral(referrerAddress);
    
    return tx;
  } catch (error: any) {
    console.error('Error registering referral:', error);
    
    // Handle specific error messages
    if (error.message.includes('Already referred')) {
      throw new Error('You already have a referrer');
    } else if (error.message.includes('Cannot refer yourself')) {
      throw new Error('You cannot refer yourself');
    } else if (error.code === 4001) {
      throw new Error('Transaction cancelled by user');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for gas');
    }
    
    throw error;
  }
};

/**
 * Register referral with wait for confirmation
 */
export const registerReferralAndWait = async (
  signer: ethers.Signer,
  referrerAddress: string,
  onProgress?: (status: string) => void
): Promise<ethers.ContractReceipt> => {
  try {
    onProgress?.('Preparing transaction...');
    
    const tx = await registerReferral(signer, referrerAddress);
    
    onProgress?.('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    onProgress?.('Confirmed!');
    
    return receipt;
  } catch (error) {
    throw error;
  }
};

/**
 * Generate referral link
 */
export const generateReferralLink = (
  address: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): string => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error('Invalid address');
  }
  
  return `${baseUrl}?ref=${address}`;
};

/**
 * Extract referral code from URL
 */
export const extractReferralCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

/**
 * Validate referral code
 */
export const validateReferralCode = (code: string | null): {
  valid: boolean;
  address?: string;
  error?: string;
} => {
  if (!code) {
    return { valid: false, error: 'No referral code provided' };
  }

  if (!ethers.utils.isAddress(code)) {
    return { valid: false, error: 'Invalid Ethereum address' };
  }

  return { valid: true, address: code };
};

/**
 * Clear referral code from URL
 */
export const clearReferralCodeFromURL = () => {
  if (typeof window === 'undefined') return;
  
  window.history.replaceState({}, document.title, window.location.pathname);
};