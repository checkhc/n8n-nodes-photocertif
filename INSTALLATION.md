# 📦 Installation Guide - n8n-nodes-photocertif

## 🚀 Quick Install (Local Testing)

### Step 1: Install Dependencies & Build

```bash
cd /home/greg/n8n-nodes-photocertif

# Install dependencies
yarn install

# Build the node
yarn build
```

### Step 2: Link to n8n

```bash
# Create n8n nodes directory if not exists
mkdir -p ~/.n8n/nodes

# Install from local path
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
```

6. Click **Test** to verify connection
7. Click **Save**

### Step 2: Generate Your Own API Key

#### Via PhotoCertif Web Interface

1. Go to https://app2.photocertif.com
2. Login to your account
3. Navigate to **My Account** → **API Keys**
4. Click **Create API Key**
5. Enter a name: "n8n Automation"
6. Select required scopes:
   - ✅ `docs:read` - Get status, download files
   - ✅ `docs:upload` - Upload documents/images
   - ✅ `docs:write` - Submit certifications
7. Click **Create**
8. **Copy the API key immediately** (shown only once!)
9. Paste into n8n credential

#### Security Best Practices

- ✅ Use separate API keys for dev/prod
- ✅ Rotate keys periodically (every 90 days)
- ✅ Delete unused keys
- ✅ Monitor API key usage in PhotoCertif dashboard
- ❌ Never commit API keys to Git
- ❌ Never share keys via email/chat

---

## 🧪 Test Installation

### Test 1: Verify Node Appears

1. Create new workflow in n8n
2. Add node (+)
3. Search "PhotoCertif"
4. You should see **PhotoCertif** node with custom icon

### Test 2: Test Credential

1. Open credential
2. Click **Test**
3. Should return success (connects to `/api/collections/list`)

### Test 3: Simple Upload

```yaml
Workflow: Test Upload
Nodes:
  1. Manual Trigger
  
  2. Function
     - Set data:
       {
         "base64_content": "SGVsbG8gUGhvdG9DZXJ0aWYh",
         "title": "Test Document"
       }
  
  3. PhotoCertif
     - Credential: [Your PhotoCertif API]
     - Resource Type: Document (media/docs)
     - Operation: Upload
     - File: {{$json.base64_content}}
     - Title: {{$json.title}}
     - Description: "Test from n8n"
  
  4. Check Output
     - Should have: {"success": true, "storage_id": "iv_..."}
```

---

## 📊 Complete Test Workflow

### Full Certification Flow (Semi-Automated)

```yaml
Name: "PhotoCertif Full Test"

Nodes:
  1. Manual Trigger
  
  2. Set Test Data
     - Code (JS):
       return {
         file: Buffer.from("Hello PhotoCertif!").toString('base64'),
         title: "Test Document " + new Date().toISOString(),
         description: "Automated test from n8n"
       };
  
  3. PhotoCertif - Upload
     - Resource: docs
     - File: {{$json.file}}
     - Title: {{$json.title}}
     - Description: {{$json.description}}
  
  4. Wait (2 seconds)
  
  5. PhotoCertif - Get Status
     - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
     - Should return: status="uploaded"
  
  6. PhotoCertif - Submit Certification
     - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
     - Name: "TestDoc"
     - Symbol: "TEST"
     - Description: "Test certification"
     - Owner: "n8n Bot"
     - Website: "https://photocertif.com"
  
  7. Email - Notify User
     - To: your-email@example.com
     - Subject: "⏳ Complete certification"
     - Body: |
         Certification ready for payment!
         
         Click here to complete:
         {{$node["PhotoCertif 1"].json["certification_url"]}}
     
  8. PhotoCertif - Wait for Certification
     - Storage ID: {{$node["PhotoCertif"].json["storage_id"]}}
     - Polling Interval: 60 (1 minute for testing)
     - Max Wait Time: 3600 (1 hour)
  
  9. Email - Success Notification
     - Subject: "✅ Certification Complete!"
     - Body: |
         NFT minted successfully!
         
         NFT Address: {{$json.nft_address}}
         Certification Date: {{$json.certification_date}}
```

**To test:**
1. Execute workflow
2. Wait for email with certification link
3. Open link in browser
4. Complete payment (~1 USD in CHECKHC)
5. Sign NFT minting transaction
6. Workflow continues automatically
7. Receive success email with NFT address

---

## 🔍 Verify Installation

### Check n8n Logs

```bash
# If using pm2
pm2 logs n8n | grep -i photocertif

# If using systemd
journalctl -u n8n | grep -i photocertif
```

**Expected output:**
```
Loaded community node: n8n-nodes-photocertif
```

### Check Node Version

```bash
cd ~/.n8n/nodes/n8n-nodes-photocertif
cat package.json | grep version
```

### Rebuild if Needed

```bash
cd /home/greg/n8n-nodes-photocertif
yarn build

# Reinstall
cd ~/.n8n/nodes
rm -rf n8n-nodes-photocertif
npm install /home/greg/n8n-nodes-photocertif

# Restart n8n
pm2 restart n8n
```

---

## 🐛 Troubleshooting

### Node Not Appearing

**Problem:** PhotoCertif node doesn't appear in node list

**Solutions:**
1. Clear n8n cache:
   ```bash
   rm -rf ~/.n8n/.cache
   pm2 restart n8n
   ```

2. Check installation:
   ```bash
   ls -la ~/.n8n/nodes/
   # Should see: n8n-nodes-photocertif/
   ```

3. Rebuild:
   ```bash
   cd /home/greg/n8n-nodes-photocertif
   yarn build
   ```

### "Module not found" Error

**Problem:** Error loading node module

**Solution:**
```bash
cd ~/.n8n/nodes
rm -rf node_modules n8n-nodes-photocertif
npm install /home/greg/n8n-nodes-photocertif
pm2 restart n8n
```

### Credential Test Fails

**Problem:** "Connection failed" when testing credential

**Checks:**
1. ✅ URL is correct: `https://app2.photocertif.com`
2. ✅ API key is valid (check in PhotoCertif dashboard)
3. ✅ Network connectivity:
   ```bash
   curl https://app2.photocertif.com/api/collections/list \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
4. ✅ Firewall allows outbound HTTPS

### Upload Fails

**Problem:** Upload operation returns error

**Common causes:**
- ❌ Invalid base64 encoding
- ❌ File too large (check PhotoCertif limits)
- ❌ Invalid file type
- ❌ API key missing upload scope

**Debug:**
```yaml
Add Error Trigger node:
  - Captures errors
  - Logs error details
  - Sends notification
```

### Certification Timeout

**Problem:** "Wait for Certification" times out

**Explanation:** User hasn't completed payment yet

**Solutions:**
1. ✅ Increase Max Wait Time (default: 24 hours)
2. ✅ Send reminder notifications
3. ✅ Check PhotoCertif interface for pending certifications
4. ✅ Verify user has sufficient CHECKHC balance

### AI Analysis Fields Missing

**Problem:** `ai_generated`, `ai_source` fields are null

**Explanation:** You're using `docs` resource type

**Solution:**
- Use `image2` resource type for AI analysis
- Only images get AI detection
- Documents don't have AI analysis

---

## 💰 Cost Considerations

### PhotoCertif Pricing

**Per Certification:**
- Documents: ~1 USD
- Art Images: ~1 USD

**Blockchain Fees (paid by user):**
- Arweave storage: ~0.02-0.05 SOL
- NFT minting: ~0.005 SOL
- **Total per NFT**: ~0.025-0.055 SOL

### CHECKHC Balance

**Users need:**
- Sufficient SOL for blockchain fees (~0.1 SOL minimum)
- CHECKHC tokens for certification fees
- Purchase CHECKHC: https://app2.photocertif.com/buy-checkhc

### Automation Costs

**n8n Workflow Costs:**
- Upload: 1 execution
- Submit Certification: 1 execution
- Wait for Certification: 1-288 executions (depending on polling)
  - 5-minute intervals = 288 checks per 24h
  - 10-minute intervals = 144 checks per 24h
  - 30-minute intervals = 48 checks per 24h

**Recommendation:** Use 10-30 minute intervals to reduce executions

---

## 🎓 Next Steps

### Production Deployment

1. **Test thoroughly** on devnet/testnet first
2. **Create production API keys** with limited scopes
3. **Set up monitoring** for workflow failures
4. **Configure error notifications**
5. **Document your workflows**
6. **Train users** on completing payment/minting

### Workflow Ideas

- **Bulk document upload** from Google Drive/Dropbox
- **Scheduled certification monitoring**
- **Automated reports** when certifications complete
- **Integration with CRM/Database**
- **Certificate PDF generation**
- **Blockchain verification workflows**

### Advanced Usage

- **Webhook triggers** for real-time processing
- **Conditional logic** based on AI detection scores
- **Multi-step approval** workflows
- **Integration with other n8n nodes** (Slack, Email, Database, etc.)

---

## 📚 Resources

- **PhotoCertif Docs**: https://photocertif.com/docs
- **n8n Docs**: https://docs.n8n.io
- **GitHub Repo**: https://github.com/checkhc/n8n-nodes-photocertif
- **Support**: support@photocertif.com

---

## 🎉 You're Ready!

Installation complete! Your n8n instance can now interact with PhotoCertif for automated document and art certification workflows.

**Remember:** This node submits certification requests. Users must complete payment and NFT minting manually in PhotoCertif interface.

Happy automating! 🚀
