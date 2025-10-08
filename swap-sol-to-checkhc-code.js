// ============================================
// OPTIONAL: AUTOMATED SOL → CHECKHC SWAP
// ============================================
// Use this node BEFORE the payment if you don't have enough CHECKHC
// This will automatically swap SOL to CHECKHC using Jupiter

const { Connection, Keypair, PublicKey, VersionedTransaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } = require('@solana/spl-token');
const bs58 = require('bs58');
const fetch = require('node-fetch');

// Configuration
const RPC_URL = 'https://api.mainnet-beta.solana.com'; // Your RPC
const JUPITER_API = 'https://quote-api.jup.ag/v6'; // Jupiter V6 API
const SOL_MINT = 'So11111111111111111111111111111111111111112'; // Native SOL
const CHECKHC_MINT = 'CUore1tNkiubxSwDEtLc3Ybs1xfWLs8uGjyydUYZ25xc'; // CHECKHC token

// Get amount needed from previous node (or manual input)
const pricingData = $('1. Get Pricing').first().json;
const AMOUNT_CHECKHC_NEEDED = pricingData.price_checkhc;
const SLIPPAGE_BPS = 100; // 1% slippage

// Get credentials
const credentials = await this.getCredentials('solanaWallet');
const privateKeyBase58 = credentials.privateKey;
const payerKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));

console.log('🔄 Starting SOL → CHECKHC swap...');
console.log('Wallet:', payerKeypair.publicKey.toString());
console.log('Amount needed:', AMOUNT_CHECKHC_NEEDED, 'CHECKHC');

// Connect to Solana
const connection = new Connection(RPC_URL, 'confirmed');

// Check current CHECKHC balance
const checkhcTokenAccount = await getAssociatedTokenAddress(
  new PublicKey(CHECKHC_MINT),
  payerKeypair.publicKey
);

let currentBalance = 0;
try {
  const accountInfo = await getAccount(connection, checkhcTokenAccount);
  currentBalance = Number(accountInfo.amount) / 1000000; // CHECKHC has 6 decimals
  console.log('Current CHECKHC balance:', currentBalance);
} catch (error) {
  console.log('No CHECKHC token account yet (will be created during swap)');
}

// Calculate how much more CHECKHC we need
const checkhcToSwap = Math.max(0, AMOUNT_CHECKHC_NEEDED - currentBalance);

if (checkhcToSwap <= 0) {
  console.log('✅ Sufficient CHECKHC balance - no swap needed');
  return {
    swapped: false,
    current_balance: currentBalance,
    amount_needed: AMOUNT_CHECKHC_NEEDED,
    message: 'Sufficient CHECKHC balance'
  };
}

console.log('Need to swap for', checkhcToSwap, 'more CHECKHC');

// Convert to raw amount (6 decimals)
const outputAmountRaw = Math.ceil(checkhcToSwap * 1000000);

console.log('📊 Getting Jupiter quote...');

// Step 1: Get quote from Jupiter
const quoteUrl = `${JUPITER_API}/quote?inputMint=${SOL_MINT}&outputMint=${CHECKHC_MINT}&amount=${outputAmountRaw}&slippageBps=${SLIPPAGE_BPS}&swapMode=ExactOut`;

const quoteResponse = await fetch(quoteUrl);
if (!quoteResponse.ok) {
  throw new Error(`Jupiter quote failed: ${quoteResponse.statusText}`);
}

const quoteData = await quoteResponse.json();
const solNeeded = Number(quoteData.inAmount) / 1000000000; // SOL has 9 decimals

console.log('Quote received:');
console.log('- SOL needed:', solNeeded);
console.log('- CHECKHC to receive:', Number(quoteData.outAmount) / 1000000);
console.log('- Price impact:', quoteData.priceImpactPct, '%');

// Check SOL balance
const solBalance = await connection.getBalance(payerKeypair.publicKey);
const solBalanceFormatted = solBalance / 1000000000;

console.log('SOL balance:', solBalanceFormatted);

if (solBalanceFormatted < solNeeded + 0.01) { // +0.01 for fees
  throw new Error(`Insufficient SOL balance. Need ${solNeeded + 0.01} SOL, have ${solBalanceFormatted} SOL`);
}

console.log('🔄 Getting swap transaction...');

// Step 2: Get swap transaction from Jupiter
const swapResponse = await fetch(`${JUPITER_API}/swap`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quoteResponse: quoteData,
    userPublicKey: payerKeypair.publicKey.toString(),
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    prioritizationFeeLamports: 'auto'
  })
});

if (!swapResponse.ok) {
  throw new Error(`Jupiter swap transaction failed: ${swapResponse.statusText}`);
}

const swapData = await swapResponse.json();

// Deserialize the transaction
const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

// Sign transaction
transaction.sign([payerKeypair]);

console.log('📤 Sending swap transaction...');

// Send transaction
const signature = await connection.sendRawTransaction(transaction.serialize(), {
  skipPreflight: false,
  maxRetries: 3
});

console.log('Transaction sent:', signature);
console.log('Waiting for confirmation...');

// Wait for confirmation
const latestBlockhash = await connection.getLatestBlockhash('confirmed');
const confirmation = await connection.confirmTransaction({
  signature,
  blockhash: latestBlockhash.blockhash,
  lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
}, 'confirmed');

if (confirmation.value.err) {
  throw new Error(`Swap transaction failed: ${JSON.stringify(confirmation.value.err)}`);
}

console.log('✅ Swap completed successfully!');

// Verify new balance
const newAccountInfo = await getAccount(connection, checkhcTokenAccount);
const newBalance = Number(newAccountInfo.amount) / 1000000;

console.log('New CHECKHC balance:', newBalance);

return {
  swapped: true,
  swap_signature: signature,
  sol_spent: solNeeded,
  checkhc_received: checkhcToSwap,
  old_balance: currentBalance,
  new_balance: newBalance,
  confirmation_url: `https://solscan.io/tx/${signature}`,
  message: 'Successfully swapped SOL to CHECKHC'
};
