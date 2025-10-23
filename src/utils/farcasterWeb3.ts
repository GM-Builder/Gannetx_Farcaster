import { ethers } from 'ethers';
import { getChainConfig, getChainAbi, CHECKIN_FEE } from './constants';
import toast from 'react-hot-toast';

export const performFarcasterCheckin = async (
  chainId: number,
  address: string
): Promise<string> => {
  try {
    console.log('🎯 Starting Farcaster sendGM...', { chainId, address });

    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    const abi = getChainAbi(chainId);
    console.log('📝 Contract:', chainConfig.contractAddress);

    const contract = new ethers.Contract(
      chainConfig.contractAddress,
      abi,
      signer
    );

    const feeInWei = ethers.utils.parseEther(CHECKIN_FEE);
    console.log('💰 Fee:', CHECKIN_FEE, 'ETH');

    // Check if already checked in today
    try {
      const lastCheckin = await contract.lastCheckinTime(address);
      const currentTime = Math.floor(Date.now() / 1000);
      const dayInSeconds = 86400;
      
      if (lastCheckin.toNumber() > 0) {
        const timeSinceLastCheckin = currentTime - lastCheckin.toNumber();
        if (timeSinceLastCheckin < dayInSeconds) {
          throw new Error('Already checked in today. Come back tomorrow!');
        }
      }
    } catch (checkError: any) {
      if (checkError.message?.includes('Already checked in')) {
        throw checkError;
      }
      console.warn('Could not check last checkin time:', checkError);
    }

    // Estimate gas
    let gasLimit;
    try {
      const estimated = await contract.estimateGas.sendGM({
        value: feeInWei,
        from: address,
      });
      gasLimit = estimated.mul(120).div(100);
      console.log('⛽ Gas estimate:', estimated.toString(), '→', gasLimit.toString());
    } catch (gasError: any) {
      console.warn('⚠️ Gas estimation failed:', gasError.message);
      gasLimit = ethers.BigNumber.from(150000);
    }

    console.log('📤 Sending sendGM transaction...');
    const tx = await contract.sendGM({
      value: feeInWei,
      gasLimit: gasLimit,
    });

    console.log('✅ Transaction sent:', tx.hash);
    toast.loading(`Confirming... ${tx.hash.slice(0, 10)}...`, { id: 'tx-wait' });

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    toast.dismiss('tx-wait');

    return receipt.transactionHash;
  } catch (error: any) {
    console.error('❌ sendGM failed:', error);
    toast.dismiss('tx-wait');
    
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    }
    
    if (error.message?.includes('Already checked in')) {
      throw error;
    }

    if (error.message?.includes('Insufficient fee')) {
      throw new Error('Insufficient fee. Need at least 0.000029 ETH');
    }

    if (error.message?.includes('execution reverted')) {
      const reason = error.reason || 'Contract execution failed';
      throw new Error(reason);
    }
    
    throw new Error(error.message || 'Transaction failed');
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};