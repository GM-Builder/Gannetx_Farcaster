#!/usr/bin/env node
// Node script (ethers v5) to debug WARPLETS_CONTRACT_ADDRESS and ownerOf for Funcaster contract
// Usage: node tools/checkWarplets.js [rpcUrl] [funcasterAddress] [ownerAddress] [fid]

const { ethers } = require('ethers');
const fs = require('fs');

async function main() {
  const rpc = process.argv[2] || 'https://1rpc.io/base';
  const funcAddr = process.argv[3] || '0xfc3EFAdEBcB41c0a151431F518e06828DA03841a';
  const owner = process.argv[4] || null;
  const fid = process.argv[5] || null;

  console.log('Using RPC:', rpc);
  console.log('Funcaster contract:', funcAddr);

  const provider = new ethers.providers.StaticJsonRpcProvider(rpc, { chainId: 8453, name: 'base' });

  const abiRaw = fs.readFileSync(require('path').resolve(__dirname, '..', 'src', 'abis', 'FuncasterNFTABI.json'));
  const ABI = JSON.parse(abiRaw.toString());
  const funcContract = new ethers.Contract(funcAddr, ABI, provider);

  try {
    console.log('\nCalling WARPLETS_CONTRACT_ADDRESS()...');
    const warpletsAddr = await funcContract.WARPLETS_CONTRACT_ADDRESS();
    console.log('WARPLETS_CONTRACT_ADDRESS =>', warpletsAddr);

    if (owner) {
      try {
        console.log(`\nCalling balanceOf(${owner}) on warplets (${warpletsAddr})...`);
        const erc721 = new ethers.Contract(warpletsAddr, ['function balanceOf(address) view returns (uint256)', 'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)', 'function ownerOf(uint256) view returns (address)'], provider);
        const bal = await erc721.balanceOf(owner);
        console.log('balanceOf =>', bal.toString());
        if (bal && bal.gt(0)) {
          if (fid) {
            console.log('\nCalling ownerOf(' + fid + ')...');
            const own = await erc721.ownerOf(ethers.BigNumber.from(fid));
            console.log('ownerOf =>', own);
          } else {
            try {
              const tokenId = await erc721.tokenOfOwnerByIndex(owner, 0);
              console.log('tokenOfOwnerByIndex =>', tokenId.toString());
            } catch (e) {
              console.warn('tokenOfOwnerByIndex failed:', e.message || e);
              console.log('Falling back to getLogs to find Transfer events...');
              const transferTopic = ethers.utils.id('Transfer(address,address,uint256)');
              const topics = [transferTopic, null, ethers.utils.hexZeroPad(owner, 32)];
              const logs = await provider.getLogs({ address: warpletsAddr, topics, fromBlock: 0, toBlock: 'latest' });
              console.log('Found logs:', logs.length);
              if (logs.length > 0) {
                const last = logs[logs.length - 1];
                console.log('Last log topics:', last.topics);
                if (last.topics.length > 3) {
                  console.log('tokenId (from topic):', ethers.BigNumber.from(last.topics[3]).toString());
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error calling balanceOf/ownerOf/tokenOfOwnerByIndex:', e);
      }
    }
  } catch (e) {
    console.error('Failed to call WARPLETS_CONTRACT_ADDRESS():', e);
    // Show additional debug info if available
    if (e.transaction) console.error('transaction:', e.transaction);
    if (e.data) console.error('data:', e.data);
  }
}

main().catch(e => { console.error('Fatal', e); process.exit(1); });
