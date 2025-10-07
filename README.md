# n8n-nodes-photocertif

Custom n8n node for **PhotoCertif** - Document and Art certification on Solana blockchain with **fully automated B2B workflows**.

## 🎯 Features

### **Core Operations**
- **📤 Upload Documents & Images** - Upload content for secure storage
  - ⭐ **NEW**: URL Support - Upload from Google Drive, Dropbox, or any public URL
  - Base64 encoding - Traditional method with base64 strings
- **💰 Get Pricing** - Retrieve current CHECKHC pricing in real-time
- **📝 Submit Certification** - Prepare certification with all metadata
  - ✅ All optional fields supported (social links, collection, etc.)
- **🔍 Get Status** - Monitor certification progress
- **⏳ Wait for Certification** - Poll status until completion (with timeout)
- **📥 Download Content** - Retrieve certified files
- **🎨 AI Analysis** - Automatic AI detection for art certification (media/image2)

### **🚀 NEW: Automated B2B Workflows (v2.0)**
- **💳 Automated CHECKHC Payment** - Pay from n8n using Solana Wallet credential
- **🤖 Server-Side NFT Minting** - NFT created and transferred automatically
- **⚡ Zero Human Intervention** - Complete end-to-end automation
- **🔐 Secure Credential Storage** - API Keys + Solana Wallet encrypted in n8n

## 🚀 Fully Automated B2B Workflows

**Complete end-to-end automation** with zero human intervention:

- ✅ **Upload** - n8n uploads documents/images to PhotoCertif
- ✅ **Get Pricing** - Retrieves current CHECKHC pricing in real-time
- ✅ **Pay Automatically** - n8n pays with CHECKHC from Solana Wallet credential
- ✅ **Mint NFT** - PhotoCertif mints NFT server-side automatically
- ✅ **Transfer** - NFT transferred to payer wallet
- ✅ **Monitor** - Check status and completion

**Use Cases:**
- 📄 High-volume document certification (100s-1000s)
- 🎨 Art collection certification and authentication
- 🏢 B2B integrations and partnerships
- 🔄 Automated certification pipelines
- ✅ Enterprise compliance workflows
- 📊 Batch processing with monitoring

---

## 📦 Installation

### Via n8n Community Nodes (When Published)

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `n8n-nodes-photocertif`
4. Click **Install**

### Manual Installation (Development)

```bash
cd ~/.n8n/nodes
npm install /path/to/n8n-nodes-photocertif
```

Restart n8n after installation.

---

## 🔑 Configuration

### Credential 1: PhotoCertif API (Required)

1. Open n8n → **Credentials** → **New Credential**
2. Search for "**PhotoCertif API**"
3. Fill in:
   - **PhotoCertif URL**: `https://localhost` (dev) or `https://app2.photocertif.com` (prod)
   - **API Key**: `pk_live_xxxxxxxxxxxxx`

**Generate API Key:**
1. Go to https://app2.photocertif.com
2. Login → **My Account** → **API Keys** → **Create API Key**
3. Select scopes: `docs:read`, `docs:upload`, `docs:write`
4. Copy the API key (starts with `pk_live_` or `pk_test_`)

---

### Credential 2: Solana Wallet ⭐ NEW (Optional - For Automated Workflows)

**Required for**: Automated B2B workflows with automatic payment

1. Open n8n → **Credentials** → **New Credential**
2. Search for "**Solana Wallet**"
3. Fill in:
   - **Private Key**: Your Solana wallet private key (base58 format)
   - **Network**: `Mainnet` (or Devnet for testing)
   - **RPC URL**: `https://api.mainnet-beta.solana.com` (or use private RPC)

**⚠️ Security Recommendations:**
- Use a **dedicated wallet** for n8n (not your main wallet)
- Store only the **necessary CHECKHC tokens** (~1000-10000 for testing)
- The private key is **encrypted** in n8n credentials
- **Never share** your private key

**Get a Private Key:**

**Option A - Export from Phantom:**
```
1. Open Phantom → Settings → Security & Privacy
2. Export Private Key → Copy (base58 format)
```

**Option B - Create new wallet:**
```bash
node -e "
const {Keypair} = require('@solana/web3.js');
const bs58 = require('bs58');
const k = Keypair.generate();
console.log('Address:', k.publicKey.toString());
console.log('Private Key:', bs58.encode(k.secretKey));
"
```

**Fund the Wallet:**
- Buy CHECKHC tokens: https://jup.ag/swap/SOL-CHECKHC
- Send to your n8n wallet address
- Recommended: 500-10000 CHECKHC (~$3-50)

---

## 📚 Operations

### **1. Get Pricing** ⭐ NEW

Get current CHECKHC pricing for certification services.

**Parameters:**
- **Resource Type**: `docs` or `image2`

**Returns:**
```json
{
  "success": true,
  "type": "docs",
  "price_checkhc": 175.48,
  "price_usd": 1.0,
  "checkhc_mint": "5tpkr...49uau",
  "payment_wallet": "C6bK...hESFg",
  "network": "mainnet-beta"
}
```

---

### **2. Upload** ⭐ Enhanced with URL Support

Upload a document or image to PhotoCertif.

**Parameters:**
- **Resource Type**: `docs` (documents) or `image2` (art)
- **Input Type** ⭐ NEW:
  - `Base64 String` - Traditional base64 encoded content
  - `URL` - Download from Google Drive, Dropbox, or any public URL
- **File (Base64)**: Base64 encoded content (if Input Type = Base64)
- **File URL**: Public URL to download file from (if Input Type = URL)
- **Title**: Content title (required)
- **Description**: Optional description

**URL Examples:**
```javascript
// Google Drive
"https://drive.google.com/uc?id=FILE_ID&export=download"

// Dropbox
"https://www.dropbox.com/s/abc123/photo.jpg?dl=1"

// Direct URL
"https://cdn.example.com/images/photo.jpg"
```

**Returns:**
```json
{
  "success": true,
  "storage_id": "iv_1234567890_abc123",
  "message": "Upload successful"
}
```

---

### **3. Submit Certification**

Submit certification form with all metadata. **Note:** User must complete payment and minting in PhotoCertif interface.

**Parameters (4 Required + 11 Optional):**

**Required:**
- **Storage ID**: `iv_xxxxx` from upload
- **Certification Name**: Name for the NFT
- **Symbol**: 4 uppercase letters (e.g., `CNTR`)
- **Description**: Detailed description
- **Owner**: Owner name

**Optional:**
- **Collection Mint Address**: NFT collection to join
- **Website URL**: Project website
- **Twitter URL**: Twitter/X profile
- **Discord URL**: Discord server
- **Instagram URL**: Instagram profile
- **Telegram URL**: Telegram channel
- **Medium URL**: Medium blog
- **Wiki URL**: Documentation wiki
- **YouTube URL**: YouTube channel

**Returns:**
```json
{
  "success": true,
  "storage_id": "iv_xxxxx",
  "notice": "Certification form submitted. User must complete payment...",
  "certification_url": "https://app2.photocertif.com/media/docs/certification?iv_storageid=iv_xxxxx"
}
```

---

### **3. Get Status**

Check certification status.

**Parameters:**
- **Storage ID**: `iv_xxxxx`

**Returns (docs):**
```json
{
  "id": "iv_xxxxx",
  "title": "Contract 2025",
  "status": "uploaded" | "certified",
  "created_at": "2025-01-06T20:00:00Z",
  "nft_address": "ABC123..." // if certified
}
```

**Returns (image2 - with AI fields):**
```json
{
  "id": "iv_xxxxx",
  "title": "Artwork",
  "status": "certified",
  "nft_address": "ABC123...",
  "ai_generated": false,
  "ai_generated_score": 0.12,
  "ai_source": "HUMAN_CREATED",
  "Human_score": 0.88,
  "ai_prediction_id": "pred_xyz"
}
```

---

### **4. Wait for Certification** ⭐

Poll status until certified or timeout. **This is the key to automation!**

**Parameters:**
- **Storage ID**: `iv_xxxxx`
- **Polling Interval**: Seconds between checks (default: 300 = 5 minutes)
- **Max Wait Time**: Maximum seconds to wait (default: 86400 = 24 hours)

**How it works:**
1. Checks status every X seconds
2. Returns immediately when `status === "certified"`
3. Times out if max wait time exceeded
4. Useful after user is notified to complete payment

**Returns:**
```json
{
  "success": true,
  "status": "certified",
  "storage_id": "iv_xxxxx",
  "nft_address": "ABC123...",
  "wait_time_seconds": 1800,
  "attempts": 6,
  "message": "Certification completed after 1800 seconds (6 checks)"
}
```

---

### **5. Download**

Download certified content.

**Parameters:**
- **Storage ID**: `iv_xxxxx`

**Returns:**
```json
{
  "download_url": "https://...",
  "expires_at": "2025-01-07T20:00:00Z"
}
```

---

## 🔄 Example Workflows

### Workflow 1: Semi-Automated Certification

```
Manual Trigger
  ↓
PhotoCertif - Upload
  - Resource: docs
  - File: {{$json.base64_content}}
  - Title: "Contract 2025"
  ↓
PhotoCertif - Submit Certification
  - Storage ID: {{$json.storage_id}}
  - Name: "Contract2025"
  - Symbol: "CNTR"
  - Description: "Legal contract"
  - Owner: "Company ABC"
  ↓
Send Email - Notification
  - To: user@example.com
  - Subject: "⏳ Complete Certification Payment"
  - Body: "Click: {{$json.certification_url}}"
  ↓
PhotoCertif - Wait for Certification
  - Storage ID: {{$json.storage_id}}
  - Polling Interval: 300 (5 minutes)
  - Max Wait Time: 86400 (24 hours)
  ↓
Send Email - Success
  - Subject: "✅ NFT Minted!"
  - Body: "NFT: {{$json.nft_address}}"
```

### Workflow 2: Bulk Upload with Monitoring

```
Schedule Trigger (Daily)
  ↓
Read Files from Folder
  ↓
Loop: For each file
  ↓
  PhotoCertif - Upload
    - File: {{$binary.data}}
    - Title: {{$json.filename}}
  ↓
  Store in Database
    - storage_id
    - status: "pending"
  ↓
Send Report
  - "Uploaded X documents, awaiting certification"
```

### Workflow 3: Status Monitor

```
Schedule Trigger (Every hour)
  ↓
Database - Get Pending Certifications
  ↓
Loop: For each pending
  ↓
  PhotoCertif - Get Status
    - Storage ID: {{$json.storage_id}}
  ↓
  IF: status === "certified"
    ↓
    Database - Update Status
    ↓
    Send Notification
    ↓
    Generate Certificate PDF
    ↓
    Upload to Cloud Storage
```

---

## 💰 Pricing Information

### PhotoCertif Pricing (Approximate)

**Services:**
- **Documents (media/docs)**: ~1 USD per certification
- **Art (media/image2)**: ~1 USD per certification

**Blockchain Fees (paid in SOL from user wallet):**
- **Arweave Storage**: ~0.02-0.05 SOL
- **NFT Minting**: ~0.005 SOL
- **Total**: ~0.025-0.055 SOL per certification

**Payment Process:**
1. Prices are shown in **USD** in config
2. Converted to **CHECKHC tokens** dynamically
3. User pays with **CHECKHC** from their balance
4. Exchange rate: fetched from `/api/pricing/current`

---

## 🎨 Differences: docs vs image2

| Feature | media/docs | media/image2 |
|---------|------------|--------------|
| **File Types** | PDF, DOCX, TXT, ZIP | JPG, PNG, GIF, WEBP |
| **AI Analysis** | ❌ No | ✅ Yes (4 levels) |
| **AI Fields in Response** | ❌ No | ✅ Yes (5 fields) |
| **Certification Levels** | N/A | HUMAN_CREATED, LIKELY_HUMAN, LIKELY_AI, AI_GENERATED |
| **NFT Attributes** | Basic | **Extended** (+ AI scores) |
| **Price** | ~1 USD | ~1 USD |

**AI Fields (image2 only):**
- `ai_generated`: Is it AI-generated?
- `ai_generated_score`: AI probability (0-1)
- `ai_source`: Certification level
- `Human_score`: Human probability
- `ai_prediction_id`: Prediction ID

---

## 🐛 Troubleshooting

### "API Key invalid"
- Verify API key is correct
- Check scopes: `docs:read`, `docs:upload`, `docs:write`
- Regenerate if needed

### "Certification timeout"
- User may not have completed payment yet
- Increase `Max Wait Time` parameter
- Send reminder notification

### "Cannot connect to PhotoCertif"
- Check URL is accessible: `https://app2.photocertif.com`
- Verify n8n can reach external networks
- Check firewall rules

### "Status stays 'uploaded'"
- Certification form submitted successfully
- User must pay and mint NFT manually
- Send link: `/media/docs/certification?iv_storageid=xxx`

---

## 🔐 Security Best Practices

1. **API Keys**: Store in n8n credentials (encrypted)
2. **HTTPS Only**: Always use HTTPS PhotoCertif URLs
3. **Scope Limitation**: Only grant necessary scopes
4. **Key Rotation**: Regenerate keys periodically
5. **Test Environment**: Use test keys for development

---

## 📖 Additional Resources

- **PhotoCertif Docs**: https://photocertif.com/docs
- **API Reference**: https://photocertif.com/docs/api
- **n8n Docs**: https://docs.n8n.io
- **GitHub**: https://github.com/checkhc/n8n-nodes-photocertif

---

## 🤝 Support

- **GitHub Issues**: https://github.com/checkhc/n8n-nodes-photocertif/issues
- **PhotoCertif Support**: support@photocertif.com
- **n8n Community**: https://community.n8n.io

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Credits

Built by [CheckHC](https://github.com/checkhc) for the PhotoCertif ecosystem.

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[URL_SUPPORT_GUIDE.md](./URL_SUPPORT_GUIDE.md)** ⭐ NEW - Upload files from Google Drive, Dropbox, URLs
- **[SOLANA_WALLET_SETUP.md](./SOLANA_WALLET_SETUP.md)** - Solana Wallet configuration
- **[AUTOMATED_B2B_GUIDE.md](./AUTOMATED_B2B_GUIDE.md)** - Complete B2B automation guide
- **[N8N_INTEGRATION_GUIDE.md](./N8N_INTEGRATION_GUIDE.md)** - Technical integration documentation
- **[CHANGELOG_V2.md](./CHANGELOG_V2.md)** - What's new in v2.0

---

## 🎯 Example Workflows Included

### **Automated B2B Workflows**:
- `workflow-docs-automated-b2b.json` - Fully automated document certification
- `workflow-image2-automated-b2b.json` - Fully automated art certification

**Import**: n8n → Workflows → Import from File

**Features**:
- ✅ 100% automated payment with Solana Wallet credential
- ✅ Server-side NFT minting
- ✅ Zero human intervention required
- ✅ Perfect for high-volume B2B integrations

---

**Version**: 2.1.0  
**Last Updated**: 2025-10-07

---

## 🆕 What's New in v2.1

### **URL Upload Support**
- Upload files directly from URLs (Google Drive, Dropbox, CDN)
- No more manual base64 encoding required
- Automatic content-type detection and conversion

### **Complete Social Links**
- All 8 optional social link fields now included in workflows
- Twitter/X, Discord, Instagram, Telegram, Medium, Wiki, YouTube
- Full NFT metadata support

See **[URL_SUPPORT_GUIDE.md](./URL_SUPPORT_GUIDE.md)** for complete documentation.
