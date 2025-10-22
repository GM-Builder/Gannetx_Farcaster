import { ethers } from 'ethers';
import { getChainConfig, getChainAbi, CHECKIN_FEE } from './constants';

export const performFarcasterCheckin = async (
  chainId: number,
  address: string
): Promise<string> => {
  try {
    console.log('🎯 Starting Farcaster checkin...', { chainId, address });

    const chainConfig = getChainConfig(chainId);
    if (!chainConfig) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      chainConfig.contractAddress,
      getChainAbi(chainId),
      signer
    );

    console.log('📝 Contract:', chainConfig.contractAddress);

    const feeInWei = ethers.utils.parseEther(CHECKIN_FEE);
    console.log('💰 Fee:', CHECKIN_FEE, 'ETH');

    const gasEstimate = await contract.estimateGas.checkin({
      value: feeInWei,
      from: address,
    });

    console.log('⛽ Gas estimate:', gasEstimate.toString());

    const tx = await contract.checkin({
      value: feeInWei,
      gasLimit: gasEstimate.mul(120).div(100),
    });

    console.log('📤 Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.transactionHash);

    return receipt.transactionHash;
  } catch (error: any) {
    console.error('❌ Checkin failed:', error);
    
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Transaction rejected by user');
    }
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    }
    
    if (error.message?.includes('Already checked in')) {
      throw new Error('Already checked in today');
    }
    
    throw new Error(error.message || 'Transaction failed');
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};