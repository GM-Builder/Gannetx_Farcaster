"use client";
import React, { useState, useCallback } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ethers } from 'ethers';
import { getChainRpcUrl, BASE_CHAIN_ID } from '@/utils/constants';
import FUNC_ABI from '@/abis/FuncasterNFTABI.json';
import { useDirectProvider } from '@/hooks/useEthersProvider';
import { switchToChain } from '@/utils/web3';
import toast from 'react-hot-toast';

// Deployed FuncasterNFT on Base mainnet (from your deploy output)
const CONTRACT_ADDRESS = '0xfc3EFAdEBcB41c0a151431F518e06828DA03841a';
const MINT_PRICE_ETH = '0.00025';

const MintClient: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { provider, signer, loading: providerLoading } = useDirectProvider();

  // Use a public RPC provider for read-only calls. Some in-wallet providers (miniapp/frame)
  // do not implement all eth_call methods; using a JsonRpcProvider for reads avoids
  // Provider.UnsupportedMethodError and missing revert data during call attempts.
  const readOnlyProvider = React.useMemo(() => {
    try {
      const rpc = getChainRpcUrl(BASE_CHAIN_ID) || 'https://mainnet.base.org';
      return new ethers.providers.JsonRpcProvider(rpc);
    } catch (e) {
      console.warn('Failed to create readOnlyProvider, falling back to wallet provider', e);
      return provider as any;
    }
  }, [provider]);

  const [warpletsFID, setWarpletsFID] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    setStatusMessage(null);
    setEligible(null);

    if (!warpletsFID || isNaN(Number(warpletsFID))) {
      setStatusMessage('Masukkan Warplets FID yang valid (angka).');
      return;
    }

    if (!isConnected || !provider) {
      setStatusMessage('Wallet belum terhubung. Klik Connect.');
      return;
    }

    setChecking(true);
    try {
      const network = await provider.getNetwork();
      // support ethers v5 and v6 network shapes
  const netAny: any = network;
  const networkChainId = netAny?.chainId ?? netAny?.chain?.id ?? netAny?.id ?? netAny;
      if (networkChainId !== BASE_CHAIN_ID) {
        try {
          await switchToChain(BASE_CHAIN_ID);
          await new Promise(r => setTimeout(r, 800));
        } catch (switchErr) {
          console.warn('Could not switch chain:', switchErr);
          setStatusMessage('Silakan pindah ke jaringan Base (mainnet) di wallet Anda.');
          setChecking(false);
          return;
        }
      }

  // Use readOnlyProvider for RPC calls to avoid unsupported-method errors from in-wallet providers
  const funcContract = new ethers.Contract(CONTRACT_ADDRESS, FUNC_ABI, readOnlyProvider);

  const mintPrice = await funcContract.MINT_PRICE();
  console.log('checkEligibility: mintPrice wei=', mintPrice.toString(), 'eth=', ethers.utils.formatEther(mintPrice));
  const mintPriceFormatted = ethers.utils.formatEther(mintPrice);

      const fidNum = ethers.BigNumber.from(warpletsFID);
      const used = await funcContract.isFIDUsed(fidNum);
      if (used) {
        setEligible(false);
        setStatusMessage('FID sudah pernah digunakan untuk minting.');
        setChecking(false);
        return;
      }

      let warpletsAddr = '';
      try {
        warpletsAddr = await funcContract.WARPLETS_CONTRACT_ADDRESS();
      } catch (e) {
        console.warn('Could not read WARPLETS_CONTRACT_ADDRESS from contract', e);
      }

      const ERC721_MIN_ABI = ['function ownerOf(uint256 tokenId) view returns (address)'];

      if (!warpletsAddr || warpletsAddr === ethers.constants.AddressZero) {
        setStatusMessage('Alamat contract Warplets tidak ditemukan di contract Funcaster.');
        setChecking(false);
        return;
      }

  const warpletsContract = new ethers.Contract(warpletsAddr, ERC721_MIN_ABI, readOnlyProvider);
      let ownerOfFID = null;
      try {
        ownerOfFID = await warpletsContract.ownerOf(fidNum);
      } catch (err: any) {
        console.error('Error calling ownerOf on Warplets contract', err);
        setStatusMessage('Gagal memverifikasi kepemilikan Warplets FID. Pastikan FID valid.');
        setChecking(false);
        return;
      }

      if (ownerOfFID.toLowerCase() !== address?.toLowerCase()) {
        setEligible(false);
        setStatusMessage('Anda bukan pemilik Warplets FID tersebut. Minting hanya untuk pemilik FID.');
        setChecking(false);
        return;
      }

  const balance = await readOnlyProvider.getBalance(address as string);
      const balanceEth = ethers.utils.formatEther(balance);
      if (balance.lt(mintPrice)) {
        setEligible(false);
        setStatusMessage(`Saldo tidak mencukupi. Biaya mint: ${mintPriceFormatted} ETH. Saldo Anda: ${balanceEth} ETH`);
        setChecking(false);
        return;
      }

      setEligible(true);
      setStatusMessage(`Eligible! Biaya mint: ${mintPriceFormatted} ETH.`);
    } catch (error: any) {
      console.error('Eligibility check failed', error);
      setStatusMessage(error.message || 'Terjadi kesalahan saat memeriksa eligibility.');
      setEligible(false);
    } finally {
      setChecking(false);
    }
  }, [warpletsFID, isConnected, provider]);

  // Auto-detect Warplets token owned by connected wallet and prefill warpletsFID
  React.useEffect(() => {
    let mounted = true;
    const detectOwnerToken = async () => {
      if (!isConnected || !provider || !address) return;
      try {
  // Use readOnlyProvider for auto-detection reads
  const funcContract = new ethers.Contract(CONTRACT_ADDRESS, FUNC_ABI, readOnlyProvider);
  const warpletsAddr = await funcContract.WARPLETS_CONTRACT_ADDRESS();
        if (!warpletsAddr || warpletsAddr === ethers.constants.AddressZero) {
          if (mounted) setStatusMessage('Warplets contract not found on Funcaster contract.');
          return;
        }

        const ERC721_ENUM_ABI = [
          'function balanceOf(address) view returns (uint256)',
          'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)'
        ];

  const warpletsContract = new ethers.Contract(warpletsAddr, ERC721_ENUM_ABI, readOnlyProvider);
  const balance = await warpletsContract.balanceOf(address);
        if (balance && balance.gt(0)) {
          const tokenId = await warpletsContract.tokenOfOwnerByIndex(address, 0);
          if (mounted) {
            setWarpletsFID(tokenId.toString());
            setStatusMessage(`Detected Warplets FID: ${tokenId.toString()}`);
            setEligible(null);
          }
        } else {
          if (mounted) setStatusMessage('You do not own any Warplets tokens.');
        }
      } catch (err: any) {
        console.warn('Auto-detect Warplets owner failed', err);
      }
    };

    detectOwnerToken();
    return () => { mounted = false; };
  }, [isConnected, provider, address]);

  const doMint = useCallback(async () => {
    if (!signer) {
      toast.error('Wallet tidak tersedia.');
      return;
    }

    if (!eligible) {
      toast.error('Anda tidak eligible untuk minting. Lakukan pengecekan eligibility terlebih dahulu.');
      return;
    }

    setMinting(true);
    setTxHash(null);
    try {
      // Read the mint price from the contract using readOnlyProvider to ensure we send the
      // exact required value (prevents underpaying/overpaying issues).
      const funcRead = new ethers.Contract(CONTRACT_ADDRESS, FUNC_ABI, readOnlyProvider);
      let mintPrice: ethers.BigNumber;
      try {
        mintPrice = await funcRead.MINT_PRICE();
      } catch (e) {
        console.warn('Failed to read MINT_PRICE from contract, falling back to constant', e);
        mintPrice = ethers.utils.parseEther(MINT_PRICE_ETH);
      }

      // Ensure the signer address matches the connected account
      try {
        const signerAddress = await signer.getAddress();
        if (address && signerAddress.toLowerCase() !== address.toLowerCase()) {
          const msg = 'Wallet signer does not match connected account. Please reconnect using the same wallet.';
          console.warn(msg, { signerAddress, connected: address });
          setStatusMessage(msg);
          setMinting(false);
          return;
        }
      } catch (saErr: any) {
        console.warn('Could not determine signer address', saErr);
        // continue; we'll still attempt ownership re-check below
      }

      // Re-verify ownership immediately before sending tx
      try {
        const warpletsAddr = await funcRead.WARPLETS_CONTRACT_ADDRESS();
        const ERC721_MIN_ABI = ['function ownerOf(uint256 tokenId) view returns (address)'];
        const warpletsContract = new ethers.Contract(warpletsAddr, ERC721_MIN_ABI, readOnlyProvider);
        const ownerNow = await warpletsContract.ownerOf(ethers.BigNumber.from(warpletsFID));
        if (ownerNow.toLowerCase() !== address?.toLowerCase()) {
          const msg = 'FID ownership check failed — according to the Warplets contract you are not the owner.';
          console.warn(msg, { ownerNow, expected: address });
          setStatusMessage(msg + ' Pastikan Anda memilih FID yang benar dan menggunakan wallet yang memiliki Warplets token.');
          setMinting(false);
          return;
        }
      } catch (ownerErr: any) {
        console.warn('Ownership re-check failed before mint, aborting', ownerErr);
        setStatusMessage('Gagal memverifikasi kepemilikan FID sebelum mint. Coba lagi.');
        setMinting(false);
        return;
      }

      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, FUNC_ABI, signer);

      // Try to estimate gas using a trusted read-only RPC. If estimate fails
      // (some RPCs or environments block eth_estimateGas), fall back to letting
      // the user's wallet/provider submit the transaction via the contract method
      // which usually triggers a secure gas estimation flow in the wallet UI.
      let gasLimit: ethers.BigNumber | undefined = undefined;
      try {
        const populated = await contractWithSigner.populateTransaction.claimFuncaster(ethers.BigNumber.from(warpletsFID), { value: mintPrice });
        gasLimit = await readOnlyProvider.estimateGas({ to: populated.to, data: populated.data, value: populated.value });
        if (gasLimit) gasLimit = gasLimit.mul(110).div(100); // add 10% buffer
      } catch (estErr) {
        console.warn('Gas estimate failed on readOnlyProvider, will let wallet/provider handle gas:', estErr);
        try {
          gasLimit = ethers.BigNumber.from(300000);
          console.log('Using fallback gasLimit', gasLimit.toString());
        } catch (be) {
          gasLimit = undefined;
        }
      }

      // If we have a gasLimit, send a low-level signed transaction via signer.sendTransaction
      // (this is optional). Otherwise, call the contract method and let the wallet UI handle gas.
      let tx;
      if (gasLimit) {
        const populated = await contractWithSigner.populateTransaction.claimFuncaster(ethers.BigNumber.from(warpletsFID), { value: mintPrice });
        const txRequest: any = {
          to: populated.to,
          data: populated.data,
          value: populated.value,
          gasLimit,
        };
        tx = await signer.sendTransaction(txRequest);
      } else {
        tx = await contractWithSigner.claimFuncaster(ethers.BigNumber.from(warpletsFID), { value: mintPrice });
      }
      setTxHash(tx.hash);
      toast('Transaction sent — waiting for confirmation...', { icon: '⏳' });
      const receipt = await tx.wait();
      toast.success('Mint succeeded!');
      // Parse logs to find the FuncasterClaimed event (signer.sendTransaction returns a raw receipt)
      let claimedEvent: any | null = null;
      try {
        const iface = new ethers.utils.Interface(FUNC_ABI as any);
        for (const log of receipt.logs || []) {
          try {
            const parsed = iface.parseLog(log as any);
            if (parsed && parsed.name === 'FuncasterClaimed') {
              claimedEvent = parsed;
              break;
            }
          } catch (e) {
            // ignore unparsable logs
          }
        }
      } catch (parseErr) {
        console.warn('Failed to parse receipt logs for events', parseErr);
      }

      if (claimedEvent) {
        const tokenId = claimedEvent.args?.tokenId?.toString();
        setStatusMessage(`Mint successful — tokenId: ${tokenId}`);
      } else {
        setStatusMessage('Mint successful — transaction confirmed.');
      }
    } catch (err: any) {
      // Log structured error info to help debugging provider/contract issues
      console.error('Mint failed', {
        message: err?.message,
        code: err?.code,
        reason: err?.reason,
        data: err?.data,
        error: err?.error,
        transaction: err?.transaction,
        receipt: err?.receipt,
      }, err);

      if (err && err.code === 4001) {
        toast.error('Transaction cancelled by user');
      } else if (err && (err?.data?.message || err?.error?.message || err?.message)) {
        const msg = err?.data?.message || err?.error?.message || err?.message;
        toast.error(msg);
        setStatusMessage(msg);
      } else {
        toast.error('Mint failed — lihat console untuk detail');
        setStatusMessage('Mint failed — lihat console untuk detail');
      }
    } finally {
      setMinting(false);
    }
  }, [signer, warpletsFID, eligible]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
  <h1 className="text-2xl font-bold mb-2">Mint Funcaster NFT (Base)</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Contract: <code className="font-mono text-xs">{CONTRACT_ADDRESS}</code></p>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Connected Wallet</label>
            <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{isConnected ? address : 'Not connected'}</div>
            {!isConnected && (
              <button onClick={() => {
                const farcasterConnector = connectors?.find(
                  c => c.id === 'farcasterFrame' || c.type === 'farcasterFrame' || c.name?.toLowerCase().includes('farcaster')
                );
                if (farcasterConnector) connect({ connector: farcasterConnector });
                else if (connectors && connectors.length) connect({ connector: connectors[0] });
                else toast.error('No wallet connectors available');
              }} className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-lg">Connect Wallet</button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Warplets FID to use</label>
            <input
              type="text"
              value={warpletsFID}
              onChange={(e) => setWarpletsFID(e.target.value)}
              placeholder={isConnected ? 'Auto-detected (if any) or enter FID' : 'Connect wallet to auto-detect FID'}
              disabled={!!warpletsFID}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={checkEligibility} disabled={checking || providerLoading} className="px-4 py-2 bg-blue-500 text-white rounded-lg">{checking ? 'Checking...' : 'Check eligibility'}</button>
            <div className="text-sm text-gray-600">Mint fee: <strong>{MINT_PRICE_ETH} ETH</strong></div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">{statusMessage}</div>
          )}

          {eligible && (
            <div className="flex gap-3">
              <button onClick={doMint} disabled={minting} className="px-4 py-2 bg-emerald-500 text-white rounded-lg">{minting ? 'Minting...' : `Mint — ${MINT_PRICE_ETH} ETH`}</button>
              {txHash && (
                <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-sm text-cyan-600">View tx</a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MintClient;
