// Run this script with: node tools/decodeAbiErrors.js
// It will print error selectors (4-byte) for custom errors in FuncasterNFTABI.json
const fs = require('fs');
const path = require('path');
const { keccak256, toUtf8Bytes } = require('ethers/lib/utils');

const abiPath = path.join(__dirname, '..', 'src', 'abis', 'FuncasterNFTABI.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

const errors = abi.filter(item => item.type === 'error');
const mapping = {};
for (const e of errors) {
  const name = e.name;
  const inputs = (e.inputs || []).map(i => i.type).join(',');
  const sig = `${name}(${inputs})`;
  const selector = keccak256(toUtf8Bytes(sig)).slice(0, 10);
  mapping[selector] = sig;
}

console.log('Found error selectors:');
for (const sel of Object.keys(mapping)) {
  console.log(sel, '->', mapping[sel]);
}

// Also print known selector from user logs for quick lookup
console.log('\nIf you have a selector (e.g. 0x5e87b9e6), look it up above.');
