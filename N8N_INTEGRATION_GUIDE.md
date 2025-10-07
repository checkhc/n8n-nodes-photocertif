# 🔄 Guide d'Intégration n8n - Workflow Automatisé PhotoCertif

## 📋 Vue d'ensemble

Ce guide explique comment créer un workflow n8n **entièrement automatisé** pour la certification PhotoCertif avec paiement CHECKHC.

---

## 🎯 Objectif

**Workflow cible** :
1. Utilisateur upload une image/document via formulaire web
2. n8n récupère les données du formulaire
3. n8n upload le fichier vers PhotoCertif
4. n8n récupère le prix en CHECKHC
5. n8n effectue le swap SOL→CHECKHC (Jupiter)
6. n8n envoie les CHECKHC au wallet PhotoCertif
7. n8n appelle l'API de certification avec la signature de paiement
8. PhotoCertif mint le NFT côté serveur
9. n8n retourne l'adresse NFT à l'utilisateur

---

## 🔧 APIs PhotoCertif Disponibles

### 1. **GET /api/pricing/service**

**Récupère le prix CHECKHC pour un type de certification**

```http
# Dev (nginx reverse proxy)
GET https://localhost/api/pricing/service?type=docs

# Production
GET https://app2.photocertif.com/api/pricing/service?type=docs
```

**Réponse** :
```json
{
  "success": true,
  "type": "docs",
  "price_checkhc": 173.84,
  "price_usd": 1,
  "checkhc_mint": "5tpkrCVVh6tjjve4TuyP8MXBwURufgAnaboaLwo49uau",
  "payment_wallet": "C6bKUrdk13g7ihmeZunRcCysT7FYwHX42DXu6Y6hESFg",
  "network": "mainnet-beta"
}
```

**Paramètres** :
- `type` : `docs`, `image2`, ou `image3`

---

### 2. **POST /api/storage/{type}/certify-with-payment**

**Certifie un document/image avec paiement vérifié**

```http
# Dev
POST https://localhost/api/storage/docs/certify-with-payment
# Production  
POST https://app2.photocertif.com/api/storage/docs/certify-with-payment

Authorization: Bearer pk_live_xxxxxxxxxxxxx
Content-Type: application/json

{
  "storage_id": "iv_abc123...",
  "payment_signature": "5kHKG789...",
  "name": "Document2025",
  "cert_symbol": "DOC1",
  "cert_description": "Description du document",
  "cert_prop": "Nom du propriétaire",
  "collection_address": "Optional",
  "instagram_url": "https://instagram.com/user",
  "twitter_url": "https://x.com/user"
}
```

**Réponse** :
```json
{
  "success": true,
  "storage_id": "iv_abc123...",
  "payment_signature": "5kHKG789...",
  "payment_verified": true,
  "status": "PROCESSING",
  "message": "Payment verified. NFT minting in progress...",
  "nft_address": "PENDING_MINT"
}
```

**Endpoints disponibles** :
- `/api/storage/docs/certify-with-payment`
- `/api/storage/image2/certify-with-payment`
- `/api/storage/image3/certify-with-payment`

---

## 🏗️ Architecture du Workflow n8n

### **Nodes requis** :

1. **Trigger Node** (Form, Webhook, Google Sheets)
2. **PhotoCertif Upload** (node existant)
3. **HTTP Request - Get Pricing**
4. **Solana Swap - SOL→CHECKHC** (Jupiter)
5. **HTTP Request - Certify with Payment**
6. **Wait/Polling** (optionnel si NFT mint asynchrone)
7. **Response/Notification**

---

## 📝 Workflow Détaillé

### **Étape 1 : Trigger & Upload**

```
[Form Trigger]
  ↓
[Set Variables]
  - fileName
  - fileBase64
  - certName
  - certSymbol
  - certDescription
  - certProp
  ↓
[PhotoCertif Upload]
  Operation: Upload
  Resource Type: docs
  File: {{$json.fileBase64}}
  Title: {{$json.fileName}}
  ↓
[Extract Storage ID]
  storage_id = {{$json.storage_id}}
```

---

### **Étape 2 : Get Pricing**

```
[HTTP Request - Get Pricing]
  Method: GET
  URL: https://app2.photocertif.com/api/pricing/service?type=docs
  ↓
[Extract Price]
  price_checkhc = {{$json.price_checkhc}}
  checkhc_mint = {{$json.checkhc_mint}}
  payment_wallet = {{$json.payment_wallet}}
```

---

### **Étape 3 : Payment avec Solana Swap**

**Option A : Utiliser le node `n8n-nodes-solana-swap`**

```
[Solana Swap - SOL to CHECKHC]
  Private Key: {{$credentials.solana_wallet.privateKey}}
  Input Token: So11111111111111111111111111111111111111112 (SOL)
  Output Token: {{$json.checkhc_mint}}
  Amount: Calculate from price_checkhc
  Slippage: 1%
  ↓
[Extract Signature]
  payment_signature = {{$json.signature}}
```

**Option B : Utiliser HTTP Request vers Jupiter API**

```json
[HTTP Request - Jupiter Quote]
  Method: GET
  URL: https://quote-api.jup.ag/v6/quote
  Query:
    - inputMint: So11111111111111111111111111111111111111112
    - outputMint: {{$json.checkhc_mint}}
    - amount: {{$json.price_checkhc * 1000000}} (avec décimales)
    - slippageBps: 100
  ↓
[HTTP Request - Jupiter Swap]
  Method: POST
  URL: https://quote-api.jup.ag/v6/swap
  Body: {
    "quoteResponse": {{$json.quote}},
    "userPublicKey": "{{$credentials.solana_wallet.publicKey}}"
  }
  ↓
[Sign & Send Transaction]
  (Utiliser @solana/web3.js dans Code node)
```

---

### **Étape 4 : Certify with Payment**

```
[HTTP Request - Certify]
  Method: POST
  URL: https://app2.photocertif.com/api/storage/docs/certify-with-payment
  Headers:
    - Authorization: Bearer {{$credentials.photoCertifApi.apiKey}}
    - Content-Type: application/json
  Body: {
    "storage_id": "{{$json.storage_id}}",
    "payment_signature": "{{$json.payment_signature}}",
    "name": "{{$json.certName}}",
    "cert_symbol": "{{$json.certSymbol}}",
    "cert_description": "{{$json.certDescription}}",
    "cert_prop": "{{$json.certProp}}"
  }
  ↓
[Check Response]
  if payment_verified === true:
    → Success
  else:
    → Error
```

---

### **Étape 5 : Wait for NFT Mint (Optionnel)**

```
[Wait Node]
  Duration: 30 seconds
  ↓
[HTTP Request - Get Status]
  Method: GET
  URL: https://app2.photocertif.com/api/storage/docs/status/iv_route?id={{$json.storage_id}}
  Headers:
    - Authorization: Bearer {{$credentials.photoCertifApi.apiKey}}
  ↓
[Check Status]
  if status === "COMPLETED":
    → Get NFT address
  else if status === "PROCESSING":
    → Loop back to Wait
  else:
    → Error
```

---

## 🔐 Credentials Requises

### **1. PhotoCertif API Credentials**

```
Name: photoCertifApi
Type: Header Auth
Fields:
  - API Key: pk_live_xxxxxxxxxxxxx
  - Base URL: https://app2.photocertif.com
```

### **2. Solana Wallet Credentials**

```
Name: solana_wallet
Type: Custom
Fields:
  - Private Key: [Base58 encoded private key]
  - Public Key: [Wallet address]
  - Network: mainnet-beta
```

---

## ⚠️ Points d'Attention

### **1. Gestion des Décimales**

CHECKHC utilise **6 décimales** :
```
173.84 CHECKHC = 173840000 (raw amount)
```

### **2. Transaction Confirmation**

Attendre que la transaction soit **confirmée** avant d'appeler l'API de certification :
```javascript
// Dans un Code node
const connection = new Connection(rpcUrl);
await connection.confirmTransaction(signature, 'confirmed');
```

### **3. Gestion d'Erreurs**

Implémenter des retry logic pour :
- RPC timeouts
- Jupiter API rate limits
- Transaction failures

### **4. Gas Fees**

Le wallet n8n doit avoir assez de SOL pour :
- Swap transaction fee (~0.001 SOL)
- Token transfer fee (~0.00001 SOL)

---

## 📊 Exemple de Workflow Complet (JSON)

```json
{
  "name": "PhotoCertif Automated Certification",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "photocertif-upload",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Upload to PhotoCertif",
      "type": "n8n-nodes-photocertif.photoCertif",
      "parameters": {
        "operation": "upload",
        "resourceType": "docs",
        "fileData": "={{$json.fileBase64}}",
        "title": "={{$json.fileName}}"
      },
      "credentials": {
        "photoCertifApi": {
          "id": "1",
          "name": "PhotoCertif API"
        }
      }
    },
    {
      "name": "Get Pricing",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "=https://app2.photocertif.com/api/pricing/service?type={{$node['Upload to PhotoCertif'].json.resourceType}}",
        "options": {}
      }
    },
    {
      "name": "Swap SOL to CHECKHC",
      "type": "n8n-nodes-solana-swap.solanaSwap",
      "parameters": {
        "operation": "swap",
        "inputMint": "So11111111111111111111111111111111111111112",
        "outputMint": "={{$node['Get Pricing'].json.checkhc_mint}}",
        "amount": "={{$node['Get Pricing'].json.price_checkhc}}",
        "slippageBps": 100
      },
      "credentials": {
        "solanaWallet": {
          "id": "2",
          "name": "Solana Wallet"
        }
      }
    },
    {
      "name": "Certify with Payment",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "=https://app2.photocertif.com/api/storage/{{$node['Upload to PhotoCertif'].json.resourceType}}/certify-with-payment",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "photoCertifApi",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "storage_id",
              "value": "={{$node['Upload to PhotoCertif'].json.storage_id}}"
            },
            {
              "name": "payment_signature",
              "value": "={{$node['Swap SOL to CHECKHC'].json.signature}}"
            },
            {
              "name": "name",
              "value": "={{$json.certName}}"
            },
            {
              "name": "cert_symbol",
              "value": "={{$json.certSymbol}}"
            },
            {
              "name": "cert_description",
              "value": "={{$json.certDescription}}"
            },
            {
              "name": "cert_prop",
              "value": "={{$json.certProp}}"
            }
          ]
        },
        "options": {}
      }
    },
    {
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$node['Certify with Payment'].json}}"
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{"node": "Upload to PhotoCertif"}]]
    },
    "Upload to PhotoCertif": {
      "main": [[{"node": "Get Pricing"}]]
    },
    "Get Pricing": {
      "main": [[{"node": "Swap SOL to CHECKHC"}]]
    },
    "Swap SOL to CHECKHC": {
      "main": [[{"node": "Certify with Payment"}]]
    },
    "Certify with Payment": {
      "main": [[{"node": "Respond to Webhook"}]]
    }
  }
}
```

---

## 🧪 Testing

### **1. Test API Pricing**
```bash
# Dev (nginx reverse proxy)
curl -k https://localhost/api/pricing/service?type=docs

# Production
curl https://app2.photocertif.com/api/pricing/service?type=docs
```

### **2. Test Upload**
```bash
# Dev
curl -k -X POST https://localhost/api/storage/docs/upload/iv_route \
  -H "Authorization: Bearer pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"fileData": "base64...", "title": "Test"}'

# Production
curl -X POST https://app2.photocertif.com/api/storage/docs/upload/iv_route \
  -H "Authorization: Bearer pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"fileData": "base64...", "title": "Test"}'
```

### **3. Test Certification (mock payment)**
```bash
# Dev
curl -k -X POST https://localhost/api/storage/docs/certify-with-payment \
  -H "Authorization: Bearer pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "storage_id": "iv_abc123",
    "payment_signature": "mockSignature123",
    "name": "TestDoc",
    "cert_symbol": "TEST"
  }'

# Production
curl -X POST https://app2.photocertif.com/api/storage/docs/certify-with-payment \
  -H "Authorization: Bearer pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "storage_id": "iv_abc123",
    "payment_signature": "mockSignature123",
    "name": "TestDoc",
    "cert_symbol": "TEST"
  }'
```

---

## 🚀 Prochaines Étapes

1. **Implémenter le mint NFT côté serveur** dans les APIs
2. **Créer des workflows n8n de test**
3. **Ajouter un système de webhook** pour notifier n8n quand le NFT est minté
4. **Implémenter un job queue** pour gérer les mints asynchrones
5. **Ajouter du monitoring** et des logs détaillés

---

## 📚 Ressources

- **API PhotoCertif**: Documentation complète dans `/AUTOMATED_PAYMENT_APIS.md`
- **Jupiter API**: https://station.jup.ag/docs/apis/swap-api
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js/
- **n8n Docs**: https://docs.n8n.io/

---

**Date de création**: 2025-10-07
**Status**: APIs créées, workflow design complet, implémentation NFT mint TODO
