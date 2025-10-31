import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import FUNC_ABI from '@/abis/FuncasterNFTABI.json';

const RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const CONTRACT = process.env.NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS || '0xfc3EFAdEBcB41c0a151431F518e06828DA03841a';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fid, valueWei } = req.body || {};
  if (typeof fid === 'undefined') return res.status(400).json({ error: 'Missing fid' });

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC);
    const iface = new ethers.utils.Interface(FUNC_ABI as any);

    const data = iface.encodeFunctionData('claimFuncaster', [ethers.BigNumber.from(fid)]);
    const callTx: any = {
      to: CONTRACT,
      data,
      value: valueWei || '0x0',
    };

    try {
      // Simulate the call; if it reverts provider.call will throw
      const result = await provider.call(callTx);
      // If call succeeds, return success (no revert)
      return res.status(200).json({ success: true, result });
    } catch (callErr: any) {
      // Provider throws on revert; try to extract revert data
      const raw = callErr?.error?.data || callErr?.data || callErr?.body || null;
      let revertData: string | null = null;
      if (typeof raw === 'string') {
        // sometimes body contains JSON string
        if (raw.startsWith('{')) {
          try {
            const parsed = JSON.parse(raw);
            revertData = parsed?.error?.data || parsed?.data || null;
          } catch (e) {
            revertData = raw;
          }
        } else {
          revertData = raw;
        }
      } else if (raw && raw.data) {
        revertData = raw.data;
      }

      // If we found a revertData hex, decode selector and map to custom error name
      let selector = null;
      let matchedError: string | null = null;
      if (revertData && typeof revertData === 'string' && revertData.startsWith('0x')) {
        selector = revertData.slice(0, 10);
        // iterate interface errors to find matching sighash
        const errors = Object.keys(iface.errors || {});
        for (const name of errors) {
          try {
            const frag = iface.getError(name);
            const sig = iface.getSighash(frag);
            if (sig === selector) {
              matchedError = name;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
      }

      return res.status(200).json({ success: false, selector, matchedError, raw: revertData });
    }
  } catch (err: any) {
    console.error('simulate-mint error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
