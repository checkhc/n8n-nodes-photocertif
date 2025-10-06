# 📦 Installation Guide - n8n-nodes-photocertif

## 🚀 Quick Install (Local Testing)

### Step 1: Install Dependencies & Build

```bash
cd /home/greg/n8n-nodes-photocertif

# Install dependencies
npm install

# Build the node
npm run build
```

### Step 2: Install in n8n

```bash
# Link to n8n nodes directory
cd ~/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif
```

### Step 3: Restart n8n

```bash
# If using systemd
sudo systemctl restart n8n

# If using pm2
pm2 restart n8n

# If running manually
# Stop n8n (Ctrl+C) and restart
n8n start
```

---

## 🔑 Configure Credentials

### Step 1: Create PhotoCertif API Credential

1. Open n8n interface
2. Go to **Credentials** (top right)
3. Click **+ New Credential**
4. Search for "**PhotoCertif API**"
5. Fill in the fields:

```
PhotoCertif URL: https://app2.photocertif.com
API Key: pk_live_a_4nr3ESDVmJaxl4NOnlbAVYh-eqR9sE2eyHprjcxxw
Solana Wallet Private Key: [Your Solana wallet base58 private key]
Solana Network: mainnet-beta
```

6. Click **Test** to verify connection
7. Click **Save**

### Step 2: Get Your Solana Private Key

#### Option A: From Phantom Wallet
1. Open Phantom
2. Settings → Security & Privacy
3. Export Private Key
4. Copy the base58 string

#### Option B: From Keypair File
```bash
# If you have a Solana keypair JSON file
cat ~/.config/solana/id.json | jq -r '.[:32] | @base64'
```

#### Option C: Create New Wallet (Recommended for automation)
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate new keypair
solana-keygen new --outfile ~/photocertif-automation.json

# Get the private key (base58)
solana-keygen pubkey ~/photocertif-automation.json
```

**⚠️ Security:** Use a **dedicated wallet** for n8n automation, not your main wallet!

---

## 🧪 Test Workflow

### Create a Simple Test

1. Create a new workflow in n8n
2. Add **Manual Trigger** node
3. Add **PhotoCertif** node:
   - **Operation**: Upload Document
   - **File**: `SGVsbG8gUGhvdG9DZXJ0aWYh` (base64 "Hello PhotoCertif!")
   - **Title**: Test Document
   - **Description**: Testing n8n node
4. Click **Execute Node**

Expected result:
```json
{
  "success": true,
  "storage_id": "iv_xxxxxxxxxxxxx",
  "message": "Document uploaded successfully"
}
```

---

## 📊 Complete Certification Workflow

```
1. Manual Trigger
   ↓
2. PhotoCertif - Upload Document
   - File: {{your_base64_content}}
   - Title: "Test Certification"
   ↓
3. Wait (2 minutes)
   ↓
4. PhotoCertif - Get Status
   - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
   ↓
5. PhotoCertif - Certify Document
   - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
   - Metadata: {"source": "n8n automation"}
   ↓
6. PhotoCertif - Get Status (verify NFT)
   - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
```

---

## 🔍 Verify Installation

### Check Node is Loaded

Look in n8n logs:
```bash
# If using pm2
pm2 logs n8n | grep photoCertif

# If using systemd
journalctl -u n8n | grep photoCertif
```

You should see:
```
Loaded community node: n8n-nodes-photocertif
```

### Check in n8n UI

1. Create new node
2. Search for "PhotoCertif"
3. You should see the **PhotoCertif** node with custom icon

---

## 💰 Prepare Your Wallet

Before running certifications, ensure your wallet has:

### Required Balances
- **SOL**: Minimum 0.1 SOL for transaction fees
- **CHECKHC**: Minimum 50 CHECKHC tokens for certifications

### Get CHECKHC Tokens
1. Visit https://app2.photocertif.com
2. Go to "Buy CHECKHC"
3. Follow purchase instructions

### Check Balances
```bash
# Check SOL balance
solana balance [YOUR_WALLET_ADDRESS]

# Check CHECKHC balance on PhotoCertif dashboard
```

---

## 🐛 Troubleshooting

### Node Not Appearing in n8n

**Solution 1:** Rebuild
```bash
cd /home/greg/n8n-nodes-photocertif
npm run build
```

**Solution 2:** Clear n8n cache
```bash
rm -rf ~/.n8n/.cache
pm2 restart n8n
```

**Solution 3:** Check n8n logs
```bash
pm2 logs n8n --lines 100
```

### "Module not found" Error

```bash
# Reinstall in n8n nodes
cd ~/.n8n/nodes
rm -rf node_modules/n8n-nodes-photocertif
npm install /home/greg/n8n-nodes-photocertif
```

### Credential Test Fails

**Check:**
1. PhotoCertif URL is accessible (try in browser)
2. API Key is valid (check in PhotoCertif dashboard)
3. Network connectivity (can reach https://app2.photocertif.com)

### "Invalid Private Key" Error

**Solutions:**
1. Ensure key is base58 encoded (not JSON array)
2. No extra spaces or newlines
3. Test key with Solana CLI:
   ```bash
   solana-keygen verify [PUBLIC_KEY] [PRIVATE_KEY]
   ```

### Certification Fails

**Check:**
1. Wallet has sufficient SOL (>0.05 SOL)
2. Wallet has sufficient CHECKHC (>15 tokens)
3. Network is not congested
4. Document was uploaded successfully first

---

## 🎓 Next Steps

### Production Deployment

Once tested locally:

1. **Publish to npm** (optional):
   ```bash
   cd /home/greg/n8n-nodes-photocertif
   npm publish
   ```

2. **Install from npm**:
   ```bash
   cd ~/.n8n/nodes
   npm install n8n-nodes-photocertif
   ```

3. **Deploy to production n8n server**

### Create Automated Workflows

Examples:
- Auto-certify uploaded files from Dropbox/Google Drive
- Scheduled certification checks
- Webhook-triggered certifications
- Batch document processing

### Monitor & Maintain

- Set up error notifications
- Monitor wallet balances
- Track certification costs
- Regular health checks

---

## 📚 Resources

- **GitHub**: https://github.com/checkhc/n8n-nodes-photocertif
- **PhotoCertif Docs**: https://photocertif.com/docs
- **n8n Docs**: https://docs.n8n.io
- **Solana Docs**: https://docs.solana.com

---

## 🎉 You're Ready!

Your n8n node is installed and ready for document certification automation! 🚀
