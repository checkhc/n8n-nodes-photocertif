# Changelog - n8n-nodes-photocertif

## [1.0.0] - 2025-01-06

### 🎉 Initial Release

Complete implementation of PhotoCertif n8n node with async workflow support.

---

## ✅ What Was Implemented

### **Node Features**

#### **5 Operations:**
1. **Upload** - Upload documents or images to PhotoCertif
2. **Submit Certification** - Submit certification form with all metadata
3. **Get Status** - Check certification status
4. **Wait for Certification** - Poll status until certified (with timeout)
5. **Download** - Download certified content

#### **2 Resource Types:**
- **docs** (media/docs) - Document certification (PDF, DOCX, TXT, ZIP, etc.)
- **image2** (media/image2) - Art certification with AI analysis (JPG, PNG, GIF, etc.)

#### **15 Input Fields for Certification:**

**Required (4):**
- Certification Name
- Symbol (4 uppercase letters)
- Description
- Owner (20 characters max)

**Optional (11):**
- Collection Mint Address
- Website URL
- Twitter/X URL
- Discord URL
- Instagram URL
- Telegram URL
- Medium URL
- Wiki URL
- YouTube URL

---

### **Credentials**

**Simplified to:**
- PhotoCertif URL (default: https://app2.photocertif.com)
- API Key (pk_live_xxxxx or pk_test_xxxxx)

**Removed:**
- ❌ walletPrivateKey (not needed - NFT minting is client-side)
- ❌ solanaNetwork (not used by API)

**Security:**
- API key stored encrypted in n8n
- Bearer token authentication
- Credential test endpoint: `/api/collections/list`

---

### **Async Workflows**

#### **Wait for Certification Operation**

**Purpose:** Poll status until user completes payment and NFT minting

**Parameters:**
- **Polling Interval**: Seconds between checks (default: 300 = 5 min)
- **Max Wait Time**: Maximum wait before timeout (default: 86400 = 24h)

**Logic:**
```
1. Submit certification form
2. Notify user to complete payment
3. Poll status every X seconds
4. Return when status === "certified"
5. Timeout if exceeds max wait time
```

**Use Case:**
```
Upload → Certify → Email User → Wait (polling) → Success Email
```

---

### **Documentation**

#### **Created:**
1. **FULL_ANALYSIS.md** - Complete sequential analysis of media/docs and media/image2 flows
2. **SOLUTION_ASYNC.md** - Async workflow strategies (polling, webhooks, wallet delegation)
3. **IMPLEMENTATION_IMAGE2.md** - Technical differences between docs and image2
4. **README.md** - Complete user documentation
5. **INSTALLATION.md** - Installation and testing guide
6. **CHANGELOG.md** - This file

#### **Corrected:**
- ✅ Pricing info (USD not CHECKHC tokens directly)
- ✅ Clarified what node CAN vs CANNOT do
- ✅ Added limitation notices about user payment requirement
- ✅ Documented all 15 input fields
- ✅ Explained AI detection (image2 only)

---

## 🔍 Technical Details

### **API Endpoints Used**

```
Upload:   POST /api/storage/{resourceType}/upload/iv_route
Status:   GET  /api/storage/{resourceType}/status/iv_route?id={storageId}
Certify:  POST /api/storage/{resourceType}/certify/iv_route
Download: GET  /api/storage/{resourceType}/download/iv_route?id={storageId}
```

### **Authentication**

```http
Authorization: Bearer {apiKey}
Content-Type: application/json
```

### **Required API Key Scopes**

- `docs:read` - Get status, download
- `docs:upload` - Upload content
- `docs:write` - Submit certifications

---

## ⚠️ Important Limitations

### **What the Node CANNOT Do:**

1. ❌ **Pay CHECKHC fees automatically** - Requires user wallet signature
2. ❌ **Mint NFT automatically** - Requires blockchain transaction signature
3. ❌ **Complete certification without user** - Payment must be done in PhotoCertif interface

### **Why These Limitations Exist:**

- **Security**: Private keys should never be sent to external systems
- **Blockchain**: NFT minting requires signing with user's wallet
- **Payment**: CHECKHC transfer is an SPL token transaction (requires signature)

### **What the Node CAN Do:**

1. ✅ **Automate bulk uploads**
2. ✅ **Prepare certification forms**
3. ✅ **Monitor certification progress**
4. ✅ **Notify users when action needed**
5. ✅ **Trigger post-certification workflows**

---

## 🎨 AI Detection (image2 only)

### **Automatic Analysis**

When using `resourceType: image2`, PhotoCertif automatically:
1. Sends image to Python AI service (`/analyze/art`)
2. Returns 4-level certification:
   - **HUMAN_CREATED** (ai_probability < 25%)
   - **LIKELY_HUMAN** (25% ≤ ai_probability < 50%)
   - **LIKELY_AI** (50% ≤ ai_probability < 75%)
   - **AI_GENERATED** (ai_probability ≥ 75%)

### **Response Fields (image2)**

```json
{
  "ai_generated": false,
  "ai_generated_score": 0.12,
  "ai_source": "HUMAN_CREATED",
  "Human_score": 0.88,
  "ai_prediction_id": "pred_xyz123"
}
```

### **Documents (docs)**

No AI analysis - documents don't need AI detection.

---

## 💰 Pricing

### **Configuration Values**

In `config/solana_referent.json`:
```json
{
  "checkhc_docs_price": 1,   // 1 USD (not CHECKHC tokens!)
  "checkhc_img_price": 1     // 1 USD (not CHECKHC tokens!)
}
```

### **Conversion Process**

1. Prices stored in **USD**
2. Converted to **CHECKHC** dynamically via `/api/pricing/current`
3. User pays with **CHECKHC tokens** from their balance
4. Exchange rate updated every 5 minutes

### **User Costs**

**Certification:**
- ~1 USD in CHECKHC (paid from PhotoCertif balance)

**Blockchain Fees (paid in SOL):**
- Arweave storage: ~0.02-0.05 SOL
- NFT minting: ~0.005 SOL
- **Total**: ~0.025-0.055 SOL per certification

---

## 🔄 Example Workflows

### **1. Semi-Automated Certification**

```
Manual Trigger
  ↓
Upload Document
  ↓
Submit Certification
  ↓
Email User (with payment link)
  ↓
Wait for Certification (polling)
  ↓
Email Success Notification
```

### **2. Bulk Upload**

```
Schedule Trigger (daily)
  ↓
Read Files from Folder
  ↓
Loop: Upload Each File
  ↓
Send Report (X files uploaded)
```

### **3. Status Monitor**

```
Schedule Trigger (hourly)
  ↓
Get Pending Certifications from DB
  ↓
Loop: Check Status
  ↓
IF certified → Update DB + Notify
```

---

## 🐛 Known Issues

### **None Currently**

This is the first stable release after complete analysis and implementation.

---

## 🚀 Future Enhancements (Roadmap)

### **Phase 2 (Future)**

1. **Webhook Callback Support**
   - PhotoCertif calls webhook when certified
   - Instant notification (no polling)
   - Requires PhotoCertif backend modification

2. **Binary Data Support**
   - Use `$binary.data` references
   - Direct file upload without base64

3. **Collection Management**
   - Create NFT collections via API
   - List user's collections

4. **Batch Operations**
   - Upload multiple files in single call
   - Bulk status checks

### **Phase 3 (Long-term)**

1. **Wallet Delegation (PhotoCertif side)**
   - PhotoCertif system wallet
   - Automatic payment from user balance
   - True end-to-end automation

2. **Advanced Monitoring**
   - Dashboard integration
   - Real-time status updates
   - Cost tracking

---

## 📝 Breaking Changes from v0.x

### **Operations Renamed**

- `uploadDocument` → `upload`
- `certifyDocument` → `certify`

### **Credential Structure**

**Removed:**
- `walletPrivateKey`
- `solanaNetwork`

**Kept:**
- `photoCertifUrl`
- `apiKey`

### **Migration Guide**

If you were using v0.x:

1. **Update credentials:**
   - Remove wallet private key
   - Keep only URL + API Key

2. **Update workflows:**
   - Change operation names
   - Add "Wait for Certification" after "Certify"
   - Add user notification step

3. **Test thoroughly** in test environment first

---

## 🙏 Credits

**Built by:** CheckHC Team  
**For:** PhotoCertif Ecosystem  
**Date:** January 6, 2025  

**Thanks to:**
- n8n community for the excellent platform
- PhotoCertif users for feedback
- Solana ecosystem for blockchain infrastructure

---

## 📚 Resources

- **GitHub**: https://github.com/checkhc/n8n-nodes-photocertif
- **npm**: https://www.npmjs.com/package/n8n-nodes-photocertif (coming soon)
- **PhotoCertif**: https://photocertif.com
- **Documentation**: See README.md and INSTALLATION.md

---

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Status**: ✅ Stable  
**Last Updated**: 2025-01-06
