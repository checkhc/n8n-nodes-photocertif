# 🔬 FULL SEQUENTIAL ANALYSIS - media/docs & media/image2

## 📋 ÉTAPE 1 : LISTE COMPLÈTE DES INPUTS

### **Champs OBLIGATOIRES**
```typescript
{
  name: string,              // Certification Name (alphanumeric only)
  cert_symbol: string,       // Symbol (4 uppercase letters max)
  cert_description: string,  // Description (alphanumeric + spaces)
  cert_prop: string,         // Owner (20 characters max)
  id: string                 // Storage ID (iv_xxxxx format)
}
```

### **Champs OPTIONNELS**
```typescript
{
  cert_C2PA: boolean,              // C2PA certification (TODO: future)
  collection_mint_address: string, // NFT Collection address
  
  // External Links (all optional)
  external_url: string,            // Website URL
  twitter_url: string,             // Twitter/X profile
  discord_url: string,             // Discord server
  instagram_url: string,           // Instagram profile
  telegram_url: string,            // Telegram channel
  medium_url: string,              // Medium blog
  wiki_url: string,                // Wiki/documentation
  youtube_url: string              // YouTube channel
}
```

---

## 🔄 ÉTAPE 2 : FLUX COMPLET media/docs

### **2.1 Upload (/api/storage/docs/upload/iv_route)**

**Input:**
```typescript
{
  file: File | base64,       // Document file
  title: string,             // Document title
  description?: string       // Optional description
}
```

**Output:**
```json
{
  "success": true,
  "storage_id": "iv_1234567890_abc123",
  "message": "Document uploaded successfully"
}
```

**Process:**
1. Authenticate user (session or API key)
2. Create unique storage ID: `iv_${timestamp}_${random}`
3. Create directory: `/var/www/photocertif/storage/{userId}/{storageId}/`
4. Save file to disk
5. Store metadata in `iv_storage` table
6. Return storage_id

---

### **2.2 Status (/api/storage/docs/status/iv_route)**

**Input:**
```
GET ?id=iv_xxxxx
```

**Output:**
```json
{
  "id": "iv_xxxxx",
  "title": "Contract 2025",
  "status": "uploaded" | "certified",
  "image_name": "document.pdf",
  "hash_cert": "sha256hash...",
  "created_at": "2025-01-06T20:00:00Z",
  "certification_date": "2025-01-06T21:00:00Z",
  "nft_address": "ABC123..." // if certified
}
```

**Process:**
1. Authenticate user
2. Query `iv_storage` table by `iv_storageid` and `userId`
3. Query `iv_certificate` table if exists
4. Return combined data

---

### **2.3 Certify (/api/storage/docs/certify/iv_route)**

**Input:**
```json
{
  "id": "iv_xxxxx",
  "name": "Contract2025",
  "cert_symbol": "CNTR",
  "cert_description": "Legal contract",
  "cert_prop": "Company ABC",
  "cert_C2PA": false,
  "collection_mint_address": "CollectionMintAddress...",
  "external_url": "https://example.com",
  "twitter_url": "https://x.com/example",
  "discord_url": "https://discord.gg/example",
  "instagram_url": "https://instagram.com/example",
  "telegram_url": "https://t.me/example",
  "medium_url": "https://medium.com/@example",
  "wiki_url": "https://wiki.example.com",
  "youtube_url": "https://youtube.com/@example"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Certification started",
  "storage_id": "iv_xxxxx"
}
```

**Process:**
1. Authenticate user
2. Validate required fields (name, cert_symbol, cert_description, cert_prop)
3. Find document in `iv_storage`
4. ❌ **NO AI ANALYSIS** (docs don't need AI detection)
5. Generate document preview/thumbnail
6. Calculate file hash (SHA256)
7. Apply watermark if needed
8. Prepare NFT metadata:
   ```json
   {
     "name": "Contract2025",
     "symbol": "CNTR",
     "description": "Legal contract",
     "image": "preview_url",
     "external_url": "https://example.com",
     "properties": {
       "category": "document",
       "files": [{"uri": "document_url", "type": "application/pdf"}]
     },
     "attributes": [
       {"trait_type": "Owner", "value": "Company ABC"},
       {"trait_type": "Certification Date", "value": "2025-01-06"},
       {"trait_type": "Hash SHA256", "value": "..."}
     ],
     "collection": {"name": "...", "family": "..."}
   }
   ```
9. Update `iv_storage` with certification data
10. **NOTE:** NFT minting is done CLIENT-SIDE with user's wallet
11. Return success

---

## 🎨 ÉTAPE 3 : FLUX COMPLET media/image2

### **3.1 Upload (/api/storage/image2/upload/iv_route)**

**Input:**
```typescript
{
  file: File | base64,       // Image file (JPG, PNG, etc.)
  title: string,             // Image title
  description?: string       // Optional description
}
```

**Output:**
```json
{
  "success": true,
  "storage_id": "iv_1234567890_abc123",
  "message": "Image uploaded successfully"
}
```

**Process:**
1. Authenticate user
2. Validate image type (JPEG, PNG, GIF, WEBP, BMP, TIFF)
3. Create unique storage ID
4. Create directory structure
5. Save image to disk
6. Store metadata in `iv_storage`
7. Return storage_id

---

### **3.2 Status (/api/storage/image2/status/iv_route)**

**Input:**
```
GET ?id=iv_xxxxx
```

**Output:**
```json
{
  "id": "iv_xxxxx",
  "title": "Artwork Title",
  "status": "uploaded" | "certified",
  "image_name": "artwork.jpg",
  "hash_cert": "sha256hash...",
  "created_at": "2025-01-06T20:00:00Z",
  "certification_date": "2025-01-06T21:00:00Z",
  "nft_address": "ABC123...",
  
  // 🎨 AI ANALYSIS FIELDS (specific to image2)
  "ai_generated": false,
  "ai_generated_score": 0.12,
  "ai_source": "HUMAN_CREATED",
  "Human_score": 0.88,
  "ai_prediction_id": "pred_xyz123"
}
```

**Process:**
1. Authenticate user
2. Query `iv_storage` table
3. Query `iv_certificate` table if exists
4. **Include AI analysis fields** in response
5. Return combined data

---

### **3.3 Certify (/api/storage/image2/certify/iv_route)**

**Input:** _(Same as media/docs)_
```json
{
  "id": "iv_xxxxx",
  "name": "ArtworkTitle",
  "cert_symbol": "ART1",
  "cert_description": "Original artwork",
  "cert_prop": "Artist Name",
  "collection_mint_address": "...",
  "external_url": "...",
  // ... all optional social URLs
}
```

**Output:**
```json
{
  "success": true,
  "message": "Certification started",
  "storage_id": "iv_xxxxx",
  
  // Additional AI fields returned
  "ai_generated": false,
  "ai_generated_score": 0.12,
  "ai_source": "HUMAN_CREATED",
  "Human_score": 0.88
}
```

**Process:**
1. Authenticate user
2. Validate required fields
3. Find image in `iv_storage`
4. ✅ **RUN AI ANALYSIS** via `detectAIGeneratedImage()`
   - Calls Python API: `POST http://127.0.0.1:8000/analyze/art`
   - Returns: `{ai_probability, human_probability, prediction, features}`
   - Determines 4 certification levels:
     - Level 1: HUMAN_CREATED (ai_probability < 25%)
     - Level 2: LIKELY_HUMAN (25% ≤ ai_probability < 50%)
     - Level 3: LIKELY_AI (50% ≤ ai_probability < 75%)
     - Level 4: AI_GENERATED (ai_probability ≥ 75%)
5. Generate image preview/thumbnail
6. Calculate file hash
7. Apply watermark based on AI detection
8. Prepare NFT metadata **WITH AI SCORES**:
   ```json
   {
     "name": "ArtworkTitle",
     "symbol": "ART1",
     "description": "Original artwork",
     "image": "preview_url",
     "attributes": [
       {"trait_type": "Owner", "value": "Artist Name"},
       {"trait_type": "Certification Level", "value": "HUMAN_CREATED"},
       {"trait_type": "AI Score", "value": 12.5},
       {"trait_type": "Human Score", "value": 87.5},
       {"trait_type": "Hash SHA256", "value": "..."}
     ]
   }
   ```
9. Update `iv_storage` with certification + AI data
10. **NOTE:** NFT minting is done CLIENT-SIDE with user's wallet
11. Return success with AI scores

---

## 💰 ÉTAPE 4 : PRICING (USD vs CHECKHC)

### **Configuration (config/solana_referent.json)**
```json
{
  "checkhc_docs_price": 1,      // 1 USD (not CHECKHC!)
  "checkhc_img_price": 1,       // 1 USD (not CHECKHC!)
  "checkhc_collection_price": 10 // 10 USD
}
```

### **Conversion Process**
1. **Server stores prices in USD** (not CHECKHC tokens)
2. **Client fetches current exchange rate** via `/api/pricing/current`
3. **Client calculates CHECKHC needed**:
   ```typescript
   const response = await fetch('/api/pricing/current?service=docs');
   // Returns: { usdPrice: 1, checkhcPrice: X, solPrice: Y, rate: Z }
   
   const checkhcNeeded = response.checkhcPrice; // Already converted
   ```
4. **Client checks user's CHECKHC balance**
5. **Client initiates payment** (SPL token transfer on Solana)
6. **Client mints NFT** after payment confirmation

### **Important Notes**
- ✅ Prices in config are in **USD**, not CHECKHC
- ✅ Conversion USD→CHECKHC is done dynamically
- ✅ n8n node does NOT handle payment
- ✅ n8n node does NOT mint NFT
- ✅ n8n node only submits certification request
- ✅ Payment & NFT minting requires user wallet (client-side)

---

## 🔐 ÉTAPE 5 : AUTHENTICATION

### **Two Methods Supported**

#### **Method 1: Next-Auth Session (Browser)**
```typescript
const session = await auth();
if (session?.user?.id) {
  userId = session.user.id;
}
```

#### **Method 2: API Key (n8n, external apps)**
```typescript
const apiKeyAuth = await authenticateApiKey(req);
if (apiKeyAuth) {
  userId = apiKeyAuth.userId;
  // Check scopes: docs:upload, docs:read, docs:write
}
```

**API Key Format:**
```
Authorization: Bearer pk_live_xxxxxxxxxxxxx
```

**Required Scopes:**
- `docs:read` - Get status
- `docs:upload` - Upload documents
- `docs:write` - Certify documents

---

## 🚫 ÉTAPE 6 : DIFFÉRENCES CRITIQUES docs vs image2

| Feature | media/docs | media/image2 |
|---------|------------|--------------|
| **File Types** | PDF, DOCX, TXT, ZIP, RAR | JPG, PNG, GIF, WEBP, BMP, TIFF |
| **AI Analysis** | ❌ NO | ✅ YES (`/analyze/art`) |
| **AI Fields in DB** | ❌ NO | ✅ YES (5 fields) |
| **Certification Levels** | N/A | 4 levels (HUMAN_CREATED, LIKELY_HUMAN, LIKELY_AI, AI_GENERATED) |
| **Watermark** | Generic | Based on AI detection |
| **NFT Attributes** | Basic (Owner, Date, Hash) | **Extended** (+ AI Score, Human Score, Cert Level) |
| **Endpoint** | `/api/storage/docs/*` | `/api/storage/image2/*` |
| **Price (USD)** | 1 USD | 1 USD |

**AI Fields (image2 only):**
```typescript
{
  ai_generated: boolean,        // Is AI-generated?
  ai_generated_score: number,   // AI probability (0-1)
  ai_source: string,            // Certification level
  Human_score: number,          // Human probability (1 - ai_score)
  ai_prediction_id: string      // Unique prediction ID
}
```

---

## 🛠️ ÉTAPE 7 : n8n NODE IMPLEMENTATION

### **What the n8n Node MUST Do**

1. **Accept Resource Type** (docs | image2)
2. **Build endpoint dynamically**: `/api/storage/${resourceType}/*`
3. **Handle ALL 15 input fields** (4 required + 11 optional)
4. **Pass API Key** in Authorization header
5. **Return appropriate response** (with or without AI fields)

### **What the n8n Node MUST NOT Do**

- ❌ Handle payment (done client-side)
- ❌ Mint NFT (done client-side with wallet)
- ❌ Calculate USD→CHECKHC conversion
- ❌ Check CHECKHC balance
- ❌ Interact with Solana blockchain

### **Example Request from n8n**

```typescript
POST /api/storage/docs/certify/iv_route
Headers:
  Authorization: Bearer pk_live_xxxxx
  Content-Type: application/json

Body:
{
  "id": "iv_1234567890_abc123",
  "name": "Contract2025",
  "cert_symbol": "CNTR",
  "cert_description": "Legal contract for partnership",
  "cert_prop": "Company ABC Inc",
  "collection_mint_address": "BMCVo8ehcpR2E92d2RUqyybQ7fMeDUWpMxNbaAsQqV8i",
  "external_url": "https://company-abc.com",
  "twitter_url": "https://x.com/companyabc",
  "discord_url": "https://discord.gg/companyabc",
  "instagram_url": "",
  "telegram_url": "",
  "medium_url": "",
  "wiki_url": "",
  "youtube_url": ""
}
```

---

## ⚠️ ÉTAPE 8 : ERREURS À CORRIGER dans MA DOCUMENTATION

### **Erreur 1: Prix en $ vs CHECKHC**
❌ **FAUX:** "~10-15 CHECKHC tokens"
✅ **VRAI:** "~1 USD (converted to CHECKHC at current rate)"

### **Erreur 2: Qui paye ?**
❌ **FAUX:** "Uses your wallet private key to pay fees"
✅ **VRAI:** "Certification request is submitted via API. Payment and NFT minting are done client-side by the user with their wallet."

### **Erreur 3: walletPrivateKey**
❌ **FAUX:** Send `walletPrivateKey` in request body
✅ **VRAI:** **DO NOT send private key!** The API certify endpoint does NOT mint NFT server-side. It only prepares metadata. NFT minting requires user wallet interaction client-side.

---

## 📝 ÉTAPE 9 : CORRECTIONS NÉCESSAIRES

### **PhotoCertif.node.ts**

1. **Remove walletPrivateKey** from certify operation
2. **Add ALL 11 optional fields** to node parameters
3. **Update descriptions** to reflect USD pricing (not CHECKHC)
4. **Clarify** that node only submits request, not mint NFT

### **PhotoCertifApi.credentials.ts**

1. **Remove walletPrivateKey** field (not needed!)
2. **Keep only**:
   - PhotoCertif URL
   - API Key
   - Solana Network (for display/info only)

### **README.md**

1. **Fix pricing** references (USD not CHECKHC)
2. **Clarify** what node does vs what client must do
3. **Remove** mention of automatic NFT minting
4. **Add** note about client-side wallet requirement

---

## ✅ ÉTAPE 10 : RÉSUMÉ FINAL

### **Ce que l'API fait (server-side):**
1. ✅ Authentifie via API Key
2. ✅ Valide les données
3. ✅ Analyse AI (image2 only)
4. ✅ Prépare les métadonnées NFT
5. ✅ Stocke sur Irys/Arweave
6. ✅ Retourne les données de certification

### **Ce que le CLIENT doit faire (browser/wallet):**
1. ❌ Connecter wallet Solana
2. ❌ Vérifier balance CHECKHC
3. ❌ Payer les frais (CHECKHC transfer)
4. ❌ Signer la transaction NFT
5. ❌ Mint le NFT on-chain

### **Ce que le node n8n fait:**
1. ✅ Soumet la demande de certification
2. ✅ Passe tous les paramètres requis
3. ✅ Récupère le status
4. ✅ Télécharge les documents
5. ❌ **NE paye PAS** les frais
6. ❌ **NE mint PAS** le NFT

---

## 🎯 CONCLUSION

Le node n8n **ne peut PAS** faire la certification complète de bout en bout car :

1. **Le NFT minting nécessite un wallet Solana connecté** (signature requise)
2. **Le paiement CHECKHC nécessite une transaction SPL token** (signature requise)
3. **Les APIs PhotoCertif ne font que PRÉPARER** la certification
4. **Le minting final est fait CLIENT-SIDE** dans le navigateur

**Utilité réelle du node n8n :**
- ✅ Automatiser l'upload de documents
- ✅ Préparer la certification (soumettre le formulaire)
- ✅ Monitorer le status
- ✅ Télécharger les documents certifiés
- ❌ **PAS pour minting automatique NFT sans intervention**

**Si l'utilisateur veut un minting 100% automatisé :**
→ Il faudrait modifier PhotoCertif pour accepter `walletPrivateKey` et mint server-side
→ Mais c'est un **risque sécurité majeur** (private keys en transit)

---

**Date:** 2025-01-06  
**Author:** Cascade AI  
**Status:** ✅ Complete Sequential Analysis
