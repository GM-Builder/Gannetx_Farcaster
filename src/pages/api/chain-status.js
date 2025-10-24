import { ethers } from "ethers";
import {
  SUPPORTED_CHAINS,
  getContractAddress,
  getChainAbi,
} from "../../utils/constants";

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    const { chainId, address } = req.body || {};
    if (!chainId || !address) {
      return res.status(400).json({ error: 'Missing chainId or address' });
    }

    const chainConfig = SUPPORTED_CHAINS[chainId];
    if (!chainConfig || !chainConfig.rpcUrls || chainConfig.rpcUrls.length === 0) {
      return res.status(400).json({ error: 'Unsupported chain or missing RPC URL' });
    }

    const rpcUrl = chainConfig.rpcUrls[0];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const contractAddress = getContractAddress(chainId);
    const abi = getChainAbi(chainId);
    if (!contractAddress || !abi) {
      return res.status(400).json({ error: 'Contract config missing for chain' });
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);

    let canActivate = true;
    let lastBeacon = null;
    let timeRemaining = 0;

    try {
      canActivate = await contract.canActivateToday(address);
      try {
        const metrics = await contract.getNavigatorMetrics(address);
        lastBeacon = metrics.lastBeacon ? metrics.lastBeacon.toNumber() : null;
        if (!canActivate && metrics.nextResetTime) {
          const nextResetTime = metrics.nextResetTime.toNumber();
          const currentTime = Math.floor(Date.now() / 1000);
          timeRemaining = Math.max(0, nextResetTime - currentTime);
        }
      } catch (innerErr) {
        // metrics optional
      }
    } catch (err) {
      console.error('Error reading contract on server:', err);
    }

    return res.status(200).json({
      chainId,
      status: {
        canCheckin: !!canActivate,
        lastCheckin: lastBeacon,
        timeUntilNextCheckin: timeRemaining,
      }
    });
  } catch (err) {
    console.error('chain-status error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err?.message });
  }
}
