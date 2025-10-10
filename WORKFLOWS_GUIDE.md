# 📘 Guide des Workflows v1.1.0

## 🎯 Vue d'ensemble

Ces workflows reproduisent **exactement** le comportement de l'interface web PhotoCertif, mais avec le wallet côté n8n pour l'automatisation B2B.

## 📦 Workflows Disponibles

### 1. `workflow-docs-certification-v1.1.0.json`
**Type:** Document Certification (PDF, DOCX, etc.)
**Flux:** Upload → Payment → Certification → NFT

### 2. `workflow-image2-certification-v1.1.0.json`
**Type:** Art Certification (JPG, PNG, etc.)
**Flux:** Upload → Payment → AI Analysis → Irys → Certification → NFT

---

## 🔧 Prérequis

### 1. Packages Installés
```bash
npm install n8n-nodes-solana-swap n8n-nodes-photocertif
```

### 2. Credentials Configurées

#### a) PhotoCertif API
```
Nom: PhotoCertif API
Type: photoCertifApi
Champs:
  - PhotoCertif URL: https://app2.photocertif.com (ou https://localhost en dev)
  - API Key: pk_live_xxxxxxxxxxxxx
```

**Obtenir une API Key:**
1. https://app2.photocertif.com
2. Login → My Account → API Keys
3. Create API Key (scopes: `docs:upload`, `docs:write`)

#### b) Solana API
```
Nom: Solana API
Type: solanaApi
Champs:
  - Network: Mainnet Beta
  - RPC Endpoint Type: Public RPC (ou Custom pour Helius/QuickNode)
  - Private Key: [Votre clé privée base58]
  - Public Key: [Votre adresse wallet]
```

**⚠️ Sécurité:**
- Utilisez un wallet **dédié** pour n8n
- Ne stockez que les CHECKHC tokens nécessaires (~1000-5000)
- Ne partagez JAMAIS la private key

---

## 📋 Workflow: Document Certification

### Architecture
```
[Input Data] 
    → [1. Get Pricing] 
    → [2. Upload Document] 
    → [3. Check CHECKHC Balance]
    → [4. Balance Sufficient?]
        → NO: [5a. Swap SOL → CHECKHC]
        → YES: Continue
    → [6. Transfer CHECKHC Payment]
    → [7. Wait Blockchain Confirmation (10s)]
    → [8. Certify Document]
    → [9. Wait For Certification (polling 60s)]
    → [10. Success Output]
```

### Étapes Détaillées

#### Input Data (Personnalisable)
```json
{
  "fileUrl": "https://example.com/document.pdf",
  "title": "Contrat 2025",
  "description": "Contrat commercial certifié",
  "cert_name": "Contract2025",
  "cert_symbol": "CNT25",
  "cert_description": "Official contract certified on Solana",
  "cert_prop": "Company Name"
}
```

#### 1. Get Pricing
**Action:** Récupère le prix actuel en CHECKHC
**Output:**
```json
{
  "price_checkhc": 175.48,
  "price_usd": 1.0,
  "checkhc_mint": "5tpkr...49uau",
  "payment_wallet": "C6bK...hESFg"
}
```

#### 2. Upload Document
**Action:** Upload le fichier sur PhotoCertif
**Output:**
```json
{
  "storageId": "iv_1234567890_xxx",
  "status": "uploaded",
  "file_size": 245678
}
```

#### 3. Check CHECKHC Balance
**Action:** Vérifie le solde CHECKHC du wallet n8n
**Output:**
```json
{
  "balance": 500.25,
  "mint": "5tpkr...49uau"
}
```

#### 4. Balance Sufficient?
**Condition:** `balance >= price_checkhc`
- **OUI:** Passe directement au transfert
- **NON:** Swap SOL → CHECKHC d'abord

#### 5a. Swap SOL → CHECKHC (Si nécessaire)
**Action:** Achète CHECKHC avec SOL via Jupiter
**Output:**
```json
{
  "signature": "3Ks8...xyz",
  "inputAmount": 0.01,
  "outputAmount": 175.48
}
```

#### 6. Transfer CHECKHC Payment
**Action:** Transfère CHECKHC vers PhotoCertif
**Output:**
```json
{
  "signature": "2Hj9...abc",
  "amount": 175.48,
  "recipient": "C6bK...hESFg"
}
```

#### 7. Wait Blockchain Confirmation
**Action:** Attend 10 secondes pour confirmation Solana
**Raison:** Évite erreurs "transaction not found"

#### 8. Certify Document
**Action:** Lance le processus de certification
**Ce qui se passe côté serveur:**
- Vérification du paiement CHECKHC
- Génération hash du document
- Préparation métadonnées NFT
- Upload Irys (stockage permanent)

**Output:**
```json
{
  "success": true,
  "message": "Certification process started"
}
```

#### 9. Wait For Certification
**Action:** Polling status toutes les 60 secondes
**Timeout:** 1800 secondes (30 minutes)
**Output:**
```json
{
  "status": "certified",
  "nft_mint": "Hg7w...nft",
  "irys_url": "https://gateway.irys.xyz/xxx",
  "metadata": {...}
}
```

#### 10. Success Output
**Action:** Formatte le résultat final
**Output:**
```json
{
  "success": true,
  "message": "Document certified successfully!",
  "storageId": "iv_1234567890_xxx",
  "certification_status": "certified",
  "nft_mint_address": "Hg7w...nft",
  "payment_signature": "2Hj9...abc"
}
```

---

## 🎨 Workflow: Art Certification (image2)

### Différences vs Docs

1. **Resource Type:** `image2` au lieu de `docs`
2. **AI Analysis:** Détection IA ajoutée (4 niveaux)
3. **Polling Interval:** 120 secondes (analyse IA prend plus de temps)
4. **Max Wait Time:** 3600 secondes (1 heure)
5. **Output supplémentaire:**
   ```json
   {
     "ai_authenticity_score": 0.92,
     "certification_level": "Certified Original Human Art",
     "permanent_storage_url": "https://gateway.irys.xyz/xxx"
   }
   ```

### Niveaux de Certification AI

| Score | Niveau | Description |
|-------|--------|-------------|
| 0-0.25 | Level 1 | Certified Original Human Art |
| 0.26-0.50 | Level 2 | Likely Human Art with Potential AI Elements |
| 0.51-0.75 | Level 3 | Likely AI-Generated with Human Modifications |
| 0.76-1.00 | Level 4 | AI-Generated Art |

---

## 🚀 Utilisation

### Import Workflow

1. **Ouvrir n8n UI**
2. **Workflows → Import from File**
3. **Sélectionner:** `workflow-docs-certification-v1.1.0.json`
4. **Configurer credentials:**
   - Cliquer sur chaque node avec icône rouge
   - Assigner les credentials PhotoCertif API et Solana API

### Personnaliser Input Data

**Modifier le node "Input Data":**
```javascript
// Remplacer les valeurs par défaut
fileUrl: "VOTRE_URL_FICHIER",
title: "VOTRE_TITRE",
cert_name: "VOTRE_NOM_NFT",
cert_symbol: "VOTRE_SYMBOLE"
```

### Exécuter

**Test Manuel:**
1. Click "Execute Workflow"
2. Vérifier chaque étape
3. Voir résultat final

**Production:**
- Remplacer "Manual Trigger" par:
  - **Webhook:** Pour API externe
  - **Schedule:** Pour batch automatique
  - **Google Sheets:** Pour traitement en masse

---

## 🔄 Cas d'Usage Avancés

### 1. Batch Certification (Google Sheets)

**Remplacer "Manual Trigger" par "Google Sheets":**
```javascript
Trigger: Google Sheets → Read Rows
Loop: For Each Row
  → Input Data (depuis row)
  → Workflow complet
  → Update Row (avec résultat)
```

### 2. Webhook API

**Remplacer "Manual Trigger" par "Webhook":**
```javascript
POST /webhook/photocertif
Body: {
  "fileUrl": "...",
  "title": "...",
  ...
}

→ Workflow s'exécute automatiquement
→ Retourne JSON result
```

### 3. Schedule Automatique

**Remplacer "Manual Trigger" par "Schedule":**
```javascript
Schedule: Chaque jour à 2h du matin
→ Lire fichiers depuis FTP/S3
→ Pour chaque fichier → Certifier
→ Envoyer rapport par email
```

---

## ⚠️ Gestion d'Erreurs

### Erreurs Courantes

#### 1. "Insufficient CHECKHC balance" même après swap
**Cause:** Swap échoué ou montant insuffisant
**Solution:**
- Vérifier solde SOL (besoin ~0.05 SOL pour swap + fees)
- Augmenter slippage (100 bps → 200 bps)

#### 2. "Transaction not found"
**Cause:** Wait trop court après transfer
**Solution:**
- Augmenter "Wait Blockchain Confirmation" à 15-20 secondes
- Utiliser commitment: "finalized" dans Solana API

#### 3. "Certification timeout"
**Cause:** Serveur surchargé ou problème AI
**Solution:**
- Augmenter "Max Wait Time" à 3600-7200 secondes
- Vérifier status manuellement: `GET /api/storage/{type}/status/iv_route?id={storageId}`

#### 4. "API Key insufficient permissions"
**Cause:** Scopes manquants
**Solution:**
- Régénérer API Key avec scopes: `docs:upload`, `docs:write`, `docs:read`

---

## 📊 Monitoring

### Logs à Surveiller

```javascript
// Node "1. Get Pricing"
console.log("CHECKHC Price:", json.price_checkhc);

// Node "3. Check CHECKHC Balance"
console.log("Wallet Balance:", json.balance);

// Node "6. Transfer CHECKHC Payment"
console.log("Payment Signature:", json.signature);

// Node "9. Wait For Certification"
console.log("Status:", json.status);
console.log("NFT Mint:", json.nft_mint);
```

### Métriques Clés

- **Success Rate:** % workflows réussis
- **Average Duration:** Temps moyen (docs: ~5-10min, image2: ~10-20min)
- **CHECKHC Cost:** Coût moyen par certification
- **Error Rate:** % erreurs par type

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Wallet Isolation:**
   - Wallet n8n ≠ Wallet personnel
   - Seulement CHECKHC tokens nécessaires

2. **API Key Rotation:**
   - Regénérer tous les 90 jours
   - Stocker dans n8n credentials (cryptées)

3. **Network:**
   - Utiliser RPC privé en production (Helius, QuickNode)
   - Éviter RPC public (rate limits)

4. **Monitoring:**
   - Alertes sur échecs répétés
   - Logs centralés (ELK, Datadog)

5. **Backup:**
   - Exporter workflows régulièrement
   - Sauvegarder storageId → nft_mint mapping

---

## 🆘 Support

### Problème avec Workflow?

1. **Vérifier credentials:**
   ```bash
   # Test PhotoCertif API
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://app2.photocertif.com/api/pricing/service?type=docs
   
   # Test Solana API
   solana balance YOUR_WALLET_ADDRESS
   ```

2. **Vérifier logs n8n:**
   ```bash
   # Voir logs exécution
   n8n → Executions → [Workflow] → View Details
   ```

3. **Tester manuellement:**
   - Exécuter workflow step by step
   - Vérifier output de chaque node

### Contacts

- **Documentation:** README.md, CHANGELOG.md
- **Issues GitHub:** https://github.com/checkhc/n8n-nodes-photocertif/issues
- **Support PhotoCertif:** contact@checkhc.com

---

## 📝 Changelog Workflows

### v1.1.0 (2025-01-10)
- ✅ Suppression anciens workflows (b2b-step1/2/3)
- ✅ Nouveaux workflows avec architecture modulaire
- ✅ Utilisation SolanaNode (de n8n-nodes-solana-swap)
- ✅ Private key reste côté n8n (jamais envoyée au serveur)
- ✅ Workflows docs + image2
- ✅ Guide complet d'utilisation

### Différences vs anciens workflows

| Aspect | Ancien (v1.0.2) | Nouveau (v1.1.0) |
|--------|-----------------|------------------|
| Architecture | Monolithique (HTTP nodes) | Modulaire (PhotoCertif + SolanaNode) |
| Private Key | Envoyée au serveur | Reste dans n8n |
| Credentials | SolanaWallet (custom) | SolanaApi (standard) |
| Endpoints | b2b-certify-step1/2/3 | certify/iv_route (standard) |
| Paiement | Serveur gère wallet | n8n gère wallet |
| Swap | Non disponible | Automatique via Jupiter |
| Maintenance | 2 packages à sync | Délégation claire |

---

**Version:** 1.1.0  
**Date:** 2025-01-10  
**Auteur:** CheckHC  
**License:** MIT
