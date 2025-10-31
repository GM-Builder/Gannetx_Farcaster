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
      // Use multiple public RPC endpoints and a FallbackProvider (round-robin/quorum=1)
      const rpcUrls = [
        'https://base.blockpi.network/v1/rpc/public',
        'https://1rpc.io/base',
        'https://base.meowrpc.com'
      ];
      const providers = rpcUrls.map((url, i) => new ethers.providers.StaticJsonRpcProvider(url, { chainId: BASE_CHAIN_ID, name: `Base-${i}` }));
      return new ethers.providers.FallbackProvider(providers, 1);
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
  const [errorDetails, setErrorDetails] = useState<string>('');

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

      // Read mint price and other data in parallel to reduce round trips and mitigate rate limits
      const fidNum = ethers.BigNumber.from(warpletsFID);
      const [mintPrice, used, warpletsAddr] = await Promise.all([
        funcContract.MINT_PRICE(),
        funcContract.isFIDUsed(fidNum),
        funcContract.WARPLETS_CONTRACT_ADDRESS()
      ]);
      console.log('checkEligibility: mintPrice wei=', mintPrice.toString(), 'eth=', ethers.utils.formatEther(mintPrice));
      const mintPriceFormatted = ethers.utils.formatEther(mintPrice);

      if (used) {
        setEligible(false);
        setStatusMessage('FID sudah pernah digunakan untuk minting.');
        setChecking(false);
        return;
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
  }, [warpletsFID, isConnected, address, readOnlyProvider]);

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

      // For Frame environments we avoid estimateGas (some providers block eth_estimateGas).
      // Instead we submit the tx with reasonable overrides and do not wait for a receipt here.
      const gasLimit = ethers.BigNumber.from(300000);
      const overrides: any = {
        value: mintPrice,
        gasLimit,
        type: 2,
        maxFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('0.1', 'gwei')
      };

      let tx;
      try {
        tx = await contractWithSigner.claimFuncaster(ethers.BigNumber.from(warpletsFID), overrides);
      } catch (callErr: any) {
        // Some providers will throw when trying to create EIP-1559 fields or unsupported methods
        console.error('Frame submit error', callErr);
        throw callErr;
      }

      setTxHash(tx.hash);
      const explorerUrl = `https://basescan.org/tx/${tx.hash}`;
      setStatusMessage(`Transaction submitted! View on BaseScan: ${explorerUrl}`);
      toast.success('Transaction submitted!');

      // Note: intentionally not awaiting tx.wait() because Frame may not expose full receipt flow.
    } catch (err: any) {
      console.error('Mint error:', err);
      // store details for UI debugging (truncate if huge)
      try {
        setErrorDetails(JSON.stringify({ message: err?.message, code: err?.code, data: err?.data, error: err?.error }, null, 2).slice(0, 2000));
      } catch (sd) {
        setErrorDetails(String(err));
      }

      // Handle Frame-specific errors
      if (err?.code === 'ACTION_REJECTED' || err?.code === 4001) {
        toast.error('Transaction ditolak');
      } else if (err?.error?.code === 3) {
        toast.error('Transaksi gagal: FID tidak eligible atau sudah digunakan');
      } else if (err?.message?.includes('eth_blockNumber')) {
        toast.error('Provider error - silakan coba lagi');
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error('Mint failed - silakan coba lagi');
      }
    } finally {
      setMinting(false);
    }
  }, [signer, warpletsFID, eligible, readOnlyProvider, address]);

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

          {errorDetails && (
            <div className="mt-2 text-xs text-red-600 font-mono break-all">
              Error: {errorDetails}
            </div>
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
