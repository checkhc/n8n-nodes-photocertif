# n8n-nodes-photocertif

Custom n8n node for **PhotoCertif** - Document certification on Solana blockchain.

## 🎯 Features

- **📤 Upload Documents** - Upload documents for secure storage and certification
- **🔍 Get Status** - Monitor certification progress and retrieve document info
- **✅ Certify Documents** - Start blockchain NFT certification on Solana
- **📥 Download Documents** - Retrieve original or certified copies
- **🔐 Secure Credentials** - Wallet private keys stored securely in n8n credentials

## 📦 Installation

### Via n8n Community Nodes (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `n8n-nodes-photocertif`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-photocertif
```

Restart n8n after installation.

## 🔑 Configuration

### Required Credentials

Create a new **PhotoCertif API** credential with:

1. **PhotoCertif URL**: Your PhotoCertif instance URL (e.g., `https://app2.photocertif.com`)
2. **API Key**: Generate from PhotoCertif → My Account → API Keys
   - Required scopes: `docs:read`, `docs:upload`, `docs:write`
3. **Solana Wallet Private Key**: Base58 encoded private key for signing NFT transactions
4. **Solana Network**: mainnet-beta (production) or devnet (testing)

### Security Notes

- Private keys are stored **encrypted** in n8n credentials
- Transmitted over **HTTPS only**
- Never logged or exposed in workflows
- Use dedicated wallets for automation

## 📚 Operations

### 1. Upload Document

Upload a document to PhotoCertif for certification.

**Parameters:**
- `File`: Base64 encoded file content or binary data reference
- `Title`: Document title (required)
- `Description`: Optional description

**Returns:**
```json
{
  "success": true,
  "storage_id": "iv_xxxxxxxxxxxxx",
  "message": "Document uploaded successfully"
}
```

### 2. Get Status

Check the certification status of a document.

**Parameters:**
- `Storage ID`: The ID returned from upload

**Returns:**
```json
{
  "id": "iv_xxxxxxxxxxxxx",
  "title": "Contract 2025",
  "status": "certified",
  "nft_address": "ABC123...",
  "certification_url": "https://...",
  "created_at": "2025-01-06T20:00:00Z"
}
```

### 3. Certify Document

Start blockchain NFT certification. This mints an NFT on Solana blockchain.

**Parameters:**
- `Storage ID`: Document to certify
- `Additional Metadata`: Optional JSON metadata for NFT

**Returns:**
```json
{
  "success": true,
  "nft_address": "ABC123...",
  "transaction_signature": "xyz..."
}
```

**Note:** This operation uses your Solana wallet to mint the NFT and pay blockchain fees (~0.02-0.05 SOL + 10-15 CHECKHC tokens).

### 4. Download Document

Download the certified document.

**Parameters:**
- `Storage ID`: Document to download

**Returns:**
```json
{
  "download_url": "https://...",
  "expires_at": "2025-01-07T20:00:00Z"
}
```

## 🔄 Example Workflows

### Workflow 1: Auto-certify from Google Drive

```
Trigger: Google Drive (New file)
  ↓
Node: Read Binary File
  ↓
Node: PhotoCertif (Upload Document)
  - File: {{$binary.data}}
  - Title: {{$json.name}}
  ↓
Node: Wait (2 minutes)
  ↓
Node: PhotoCertif (Certify Document)
  - Storage ID: {{$json.storage_id}}
  ↓
Node: PhotoCertif (Get Status)
  - Storage ID: {{$json.storage_id}}
  ↓
Node: Email (Send notification)
  - Subject: "Document Certified"
  - Body: "NFT Address: {{$json.nft_address}}"
```

### Workflow 2: Scheduled certification check

```
Trigger: Schedule (Every hour)
  ↓
Node: HTTP Request (Get list of pending docs)
  ↓
Loop: For each document
  ↓
  Node: PhotoCertif (Get Status)
  ↓
  If: status !== 'certified'
    ↓
    Node: PhotoCertif (Certify Document)
```

### Workflow 3: Webhook-triggered certification

```
Trigger: Webhook
  - POST /certify
  - Body: {file: base64, title: string}
  ↓
Node: PhotoCertif (Upload Document)
  - File: {{$json.file}}
  - Title: {{$json.title}}
  ↓
Node: PhotoCertif (Certify Document)
  - Storage ID: {{$json.storage_id}}
  ↓
Node: Respond to Webhook
  - Body: {{$json}}
```

## 🔐 Security Best Practices

1. **Use HTTPS**: Always use HTTPS PhotoCertif URLs
2. **Dedicated Wallets**: Create separate Solana wallets for n8n automation
3. **Test on Devnet**: Test workflows on devnet before mainnet
4. **Monitor Costs**: Track SOL and CHECKHC token consumption
5. **Rate Limiting**: Add delays between operations to avoid API limits
6. **Error Handling**: Use "Continue on Fail" for production workflows

## 💰 Costs

### Blockchain Fees (paid in SOL from your wallet)
- **Upload to Arweave**: ~0.02-0.05 SOL
- **NFT Minting**: ~0.005 SOL
- **Total per certification**: ~0.025-0.055 SOL

### PhotoCertif Fees (paid in CHECKHC tokens)
- **Document Certification**: ~10-15 CHECKHC tokens
- **Ensure your wallet has sufficient CHECKHC balance**

## 🐛 Troubleshooting

### "API Key invalid"
- Verify API key is correct
- Check API key has required scopes (`docs:*`)
- Regenerate key if needed

### "Insufficient SOL balance"
- Check wallet has enough SOL for transaction fees
- Minimum: 0.1 SOL recommended

### "Insufficient CHECKHC balance"
- Purchase CHECKHC tokens
- Check balance: `https://app2.photocertif.com/my-account`

### "Private key invalid"
- Ensure private key is base58 encoded
- Test wallet on Solana explorer
- Use correct network (mainnet/devnet)

### "Certification failed"
- Check document was uploaded successfully first
- Verify wallet can sign transactions
- Check blockchain network status

## 📖 Documentation

- **PhotoCertif Docs**: https://photocertif.com/docs
- **API Reference**: https://photocertif.com/docs/api
- **n8n Docs**: https://docs.n8n.io

## 🤝 Support

- **GitHub Issues**: https://github.com/checkhc/n8n-nodes-photocertif/issues
- **PhotoCertif Support**: support@photocertif.com
- **n8n Community**: https://community.n8n.io

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Credits

Built by [CheckHC](https://github.com/checkhc) for the PhotoCertif ecosystem.
