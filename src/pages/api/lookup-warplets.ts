import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import FUNC_ABI from '@/abis/FuncasterNFTABI.json';

const DEFAULT_RPC = 'https://1rpc.io/base';
const CONTRACT_ADDRESS = '0xfc3EFAdEBcB41c0a151431F518e06828DA03841a';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rpc = (process.env.BASE_RPC as string) || DEFAULT_RPC;
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc, { chainId: 8453, name: 'base' });

  const address = (req.method === 'GET' ? req.query.address : req.body?.address) as string | undefined;
  if (!address) {
    return res.status(400).json({ error: 'address is required' });
  }

  try {
    const funcContract = new ethers.Contract(CONTRACT_ADDRESS, FUNC_ABI as any, provider);
    const warpletsAddr = await funcContract.WARPLETS_CONTRACT_ADDRESS();

    if (!warpletsAddr || warpletsAddr === ethers.constants.AddressZero) {
      return res.status(200).json({ warpletsAddr: null });
    }

    // Try balanceOf / tokenOfOwnerByIndex / ownerOf
    const erc721Abi = ['function balanceOf(address) view returns (uint256)', 'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)', 'function ownerOf(uint256) view returns (address)'];
    const warplets = new ethers.Contract(warpletsAddr, erc721Abi, provider);

    let balance = null;
    try {
      balance = await warplets.balanceOf(address);
    } catch (e) {
      // ignore
    }

    let tokenId: string | null = null;
    try {
      if (balance && balance.gt(0)) {
        try {
          const tid = await warplets.tokenOfOwnerByIndex(address, 0);
          tokenId = tid.toString();
        } catch (enumErr) {
          // fallback to scanning logs
          const transferTopic = ethers.utils.id('Transfer(address,address,uint256)');
          const topics = [transferTopic, null, ethers.utils.hexZeroPad(address, 32)];
          const logs = await provider.getLogs({ address: warpletsAddr, topics, fromBlock: 0, toBlock: 'latest' });
          if (logs && logs.length) {
            const last = logs[logs.length - 1];
            if (last.topics && last.topics.length > 3) {
              tokenId = ethers.BigNumber.from(last.topics[3]).toString();
            } else {
              try {
                const iface = new ethers.utils.Interface(['event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)']);
                const parsed = iface.parseLog(last as any);
                tokenId = parsed?.args?.tokenId?.toString() ?? null;
              } catch (p) {
                tokenId = null;
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    let ownerOf = null;
    if (tokenId) {
      try {
        ownerOf = await warplets.ownerOf(ethers.BigNumber.from(tokenId));
      } catch (e) {
        // ignore
      }
    }

    return res.status(200).json({ warpletsAddr, balance: balance ? balance.toString() : null, tokenId, ownerOf });
  } catch (err: any) {
    console.error('lookup-warplets error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
