# 📖 Guide d'Utilisation - Workflow media/docs dans n8n

## 🎯 Vue d'Ensemble

**Ce que n8n va GÉRER automatiquement** :
- ✅ Récupération du prix CHECKHC en temps réel
- ✅ Upload du document sur PhotoCertif
- ✅ Soumission du formulaire de certification
- ✅ Vérification du statut
- ✅ Communication avec l'API PhotoCertif

**Ce que n8n NE GÈRE PAS (intervention humaine requise)** :
- ❌ Le paiement en CHECKHC
- ❌ La création du NFT (se fait après paiement)
- ❌ La connexion du wallet Solana

---

## 🔄 Flux Complet - Scénario Réel

### **📍 Phase 1 : Automatisée par n8n**

#### **1. Préparation des Données (TOI)**
```
TU FAIS :
- Encoder ton document PDF/DOCX en base64
- Remplir les informations de certification :
  * Nom du document
  * Description
  * Nom de la certification NFT
  * Symbol (4 lettres max)
  * Description de la certification
  * Nom du propriétaire
```

**Exemple concret** :
```
Document : contract_2025.pdf
Title : "Contract ABC-2025"
Description : "Official contract between Company A and Company B"
Cert Name : "ContractABC2025"
Cert Symbol : "CABC"
Cert Description : "Official certification for contract ABC-2025"
Cert Owner : "Company ABC Inc"
```

---

#### **2. Modification du Workflow (TOI)**
```
TU FAIS dans n8n :
1. Ouvrir le workflow "PhotoCertif - Document Certification"
2. Cliquer sur le node "Test Data (Modify Here)"
3. Remplacer les valeurs par défaut par tes données
4. Enregistrer
```

**Interface n8n - Node "Test Data"** :
```
┌─────────────────────────────────────────┐
│ Test Data (Modify Here)                 │
├─────────────────────────────────────────┤
│ fileBase64: data:application/pdf;...    │ ← TON PDF encodé
│ title: "Contract ABC-2025"              │ ← TON titre
│ description: "Official contract..."     │ ← TA description
│ cert_name: "ContractABC2025"            │ ← TON nom NFT
│ cert_symbol: "CABC"                     │ ← TON symbol
│ cert_description: "Official cert..."    │ ← TA description NFT
│ cert_owner: "Company ABC Inc"           │ ← TON nom propriétaire
└─────────────────────────────────────────┘
```

---

#### **3. Exécution du Workflow (TOI + n8n)**
```
TU FAIS :
- Cliquer sur "Test workflow" en haut à droite dans n8n

n8n EXÉCUTE AUTOMATIQUEMENT :
```

**Node 1 : Get Pricing** ⚡
```javascript
// n8n appelle automatiquement :
GET https://localhost/api/pricing/service?type=docs

// Réponse reçue :
{
  "success": true,
  "type": "docs",
  "price_checkhc": 175.48,      // Prix actuel en CHECKHC
  "price_usd": 1,               // Prix en USD
  "checkhc_mint": "5tpkr...",   // Adresse du token CHECKHC
  "payment_wallet": "C6bK...",   // Wallet pour le paiement
  "network": "mainnet-beta"
}
```

**Ce que ça signifie** :
- Le prix est calculé en temps réel (taux CHECKHC/USD actuel)
- Tu sais exactement combien de CHECKHC sont nécessaires
- Tu connais l'adresse du wallet pour le paiement

---

**Node 2 : Upload Document** ⚡
```javascript
// n8n appelle automatiquement :
POST https://localhost/api/storage/docs/upload/iv_route
{
  "file": "data:application/pdf;base64,...",  // Ton PDF
  "title": "Contract ABC-2025",
  "description": "Official contract..."
}

// Réponse reçue :
{
  "storage_id": "iv_1728316892508_wp776fb",  // ID unique du document
  "status": "uploaded",
  "hash": "abc123def456...",                  // Hash du document
  "message": "File uploaded successfully",
  "user_id": "user_xxx"
}
```

**Ce que ça signifie** :
- Ton document est uploadé sur PhotoCertif
- Tu reçois un `storage_id` unique (important !)
- Le hash du document est calculé pour l'intégrité

---

**Node 3 : Submit Certification** ⚡
```javascript
// n8n appelle automatiquement :
POST https://localhost/api/storage/docs/certify/iv_route
{
  "id": "iv_1728316892508_wp776fb",     // storage_id de l'étape 2
  "name": "ContractABC2025",
  "cert_symbol": "CABC",
  "cert_description": "Official certification...",
  "cert_prop": "Company ABC Inc",
  "cert_C2PA": false
}

// Réponse reçue :
{
  "success": true,
  "message": "Certification form submitted",
  "storage_id": "iv_1728316892508_wp776fb",
  "notice": "Certification form submitted. User must complete payment...",
  "certification_url": "https://localhost/media/docs/certification?iv_storageid=iv_1728316892508_wp776fb"
}
```

**Ce que ça signifie** :
- Le formulaire de certification est soumis à PhotoCertif
- Une URL de certification est générée
- **Cette URL est IMPORTANTE** : c'est là que tu vas payer !

---

**Node 4 : Check Status** ⚡
```javascript
// n8n appelle automatiquement :
GET https://localhost/api/storage/docs/status/iv_route?id=iv_1728316892508_wp776fb

// Réponse reçue :
{
  "status": "COMPLETED",              // Statut actuel
  "storage_id": "iv_1728316892508_wp776fb",
  "title": "Contract ABC-2025",
  "hash": "abc123def456...",
  "file_type": "application/pdf",
  "created_at": "2025-10-07T15:00:00.000Z"
}
```

**Ce que ça signifie** :
- Le document est prêt pour la certification
- Statut "COMPLETED" = formulaire soumis, en attente de paiement
- Toutes les infos sont disponibles pour créer le NFT

---

#### **4. Résultat dans n8n (TOI)**
```
TU VOIS dans le node "Results Summary" :

┌────────────────────────────────────────────┐
│ 💰 Pricing Info                            │
│ Type: docs                                 │
│ Price CHECKHC: 175.48                      │
│ Price USD: $1                              │
│ Payment Wallet: C6bKUrdk13...              │
│ Network: mainnet-beta                      │
├────────────────────────────────────────────┤
│ 📄 Upload Result                           │
│ Storage ID: iv_1728316892508_wp776fb      │
│ Status: uploaded                           │
│ Hash: abc123def456...                      │
├────────────────────────────────────────────┤
│ ✅ Certification Submitted                 │
│ Notice: Certification form submitted...    │
│ Certification URL: https://localhost/...   │ ← IMPORTANT !
│                                            │
│ 👉 Next Step: User must complete payment  │
│    and NFT minting at the URL above        │
├────────────────────────────────────────────┤
│ 🔍 Current Status                          │
│ Status: COMPLETED                          │
│ Storage ID: iv_1728316892508_wp776fb      │
└────────────────────────────────────────────┘
```

**TU DOIS COPIER** : L'URL de certification !

---

### **📍 Phase 2 : Intervention Humaine (TOI)**

#### **5. Ouvrir l'URL de Certification (TOI)**
```
TU FAIS :
1. Copier l'URL depuis le Results Summary
   Exemple : https://localhost/media/docs/certification?iv_storageid=iv_1728316892508_wp776fb

2. Ouvrir cette URL dans ton navigateur

3. Tu arrives sur la page de certification PhotoCertif
```

**Interface PhotoCertif - Page de Certification** :
```
┌─────────────────────────────────────────────────────┐
│                    PhotoCertif                       │
│             Document Certification                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📄 Contract ABC-2025                                │
│                                                      │
│ Status: ⏳ Pending Payment                          │
│                                                      │
│ ┌─────────────────────────────────────────────┐   │
│ │  Document Information                        │   │
│ │  - Title: Contract ABC-2025                  │   │
│ │  - Hash: abc123def456...                     │   │
│ │  - Uploaded: 2025-10-07                      │   │
│ └─────────────────────────────────────────────┘   │
│                                                      │
│ ┌─────────────────────────────────────────────┐   │
│ │  NFT Certification Details                   │   │
│ │  - Name: ContractABC2025                     │   │
│ │  - Symbol: CABC                              │   │
│ │  - Description: Official certification...    │   │
│ │  - Owner: Company ABC Inc                    │   │
│ └─────────────────────────────────────────────┘   │
│                                                      │
│ ┌─────────────────────────────────────────────┐   │
│ │  💰 Payment Information                      │   │
│ │  Price: 175.48 CHECKHC (~1 USD)             │   │
│ │                                              │   │
│ │  [🔌 Connect Wallet]                        │   │ ← BOUTON
│ └─────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

#### **6. Connecter ton Wallet Solana (TOI)**
```
TU FAIS :
1. Cliquer sur "Connect Wallet"
2. Choisir ton wallet (Phantom, Solflare, etc.)
3. Approuver la connexion dans ton wallet
```

**Interface après connexion** :
```
┌─────────────────────────────────────────────────────┐
│ 💰 Payment Information                              │
│ Price: 175.48 CHECKHC (~1 USD)                      │
│                                                      │
│ Wallet Connected: Dt5g...Kx9m                       │
│                                                      │
│ Your CHECKHC Balance: 1,250.00 CHECKHC ✅          │
│                                                      │
│ ☑️ I accept the terms and conditions               │
│                                                      │
│ [🚀 Create NFT Certificate] ← Bouton actif         │
└─────────────────────────────────────────────────────┘
```

---

#### **7. Créer le NFT (TOI)**
```
TU FAIS :
1. Cocher "I accept the terms and conditions"
2. Cliquer sur "Create NFT Certificate"
3. Approuver la transaction dans ton wallet
```

**Ce qui se passe automatiquement (PhotoCertif)** :
```
PhotoCertif FAIT AUTOMATIQUEMENT :

1. Vérifie ton balance CHECKHC
2. Crée la transaction de paiement :
   - 175.48 CHECKHC envoyés au wallet PhotoCertif
   - Si tu as un referrer, une commission est déduite
3. Upload les métadonnées sur IPFS/Pinata
4. Crée le NFT sur Solana blockchain
5. Transfère le NFT à ton wallet
6. Met à jour le statut en base de données
```

**Transaction Solana** :
```
Transaction 1: Paiement CHECKHC
From: Ton wallet (Dt5g...Kx9m)
To: PhotoCertif wallet (C6bK...hESFg)
Amount: 175.48 CHECKHC
Status: ✅ Confirmed

Transaction 2: NFT Mint & Transfer
NFT Created: ContractABC2025 (CABC)
Mint Address: FxYz...Ab12
Owner: Ton wallet (Dt5g...Kx9m)
Status: ✅ Confirmed
```

---

#### **8. Certification Complétée ! (TOI)**
```
INTERFACE PHOTOCERTIF - Succès :

┌─────────────────────────────────────────────────────┐
│                    🎉 Success !                      │
│                                                      │
│ ✅ NFT Certificate Created Successfully             │
│                                                      │
│ ┌─────────────────────────────────────────────┐   │
│ │  NFT Information                             │   │
│ │  Name: ContractABC2025                       │   │
│ │  Symbol: CABC                                │   │
│ │  Mint Address: FxYz...Ab12                   │   │ ← TON NFT !
│ │                                              │   │
│ │  [View on Solscan] [View in Wallet]         │   │
│ └─────────────────────────────────────────────┘   │
│                                                      │
│ ┌─────────────────────────────────────────────┐   │
│ │  Transaction Details                         │   │
│ │  Payment: abc123... ✅                       │   │
│ │  NFT Mint: def456... ✅                      │   │
│ │  Status: Certified                           │   │
│ └─────────────────────────────────────────────┘   │
│                                                      │
│ [Download Certificate PDF] [Share]                  │
└─────────────────────────────────────────────────────┘
```

---

### **📍 Phase 3 : Vérification (optionnel - n8n)**

#### **9. Vérifier dans n8n (TOI + n8n)**
```
TU PEUX (optionnel) :
- Relancer le workflow
- OU modifier le workflow pour ajouter un polling automatique
```

**Option A : Re-exécuter Check Status manuellement**
```
TU FAIS dans n8n :
1. Cliquer sur le node "4. Check Status"
2. Cliquer sur "Execute Node"

n8n APPELLE :
GET https://localhost/api/storage/docs/status/iv_route?id=iv_1728316892508_wp776fb

RÉPONSE :
{
  "status": "certified",           ← Changé !
  "storage_id": "iv_1728316892508_wp776fb",
  "nft_mint": "FxYz...Ab12",       ← Adresse NFT !
  "transaction_signature": "abc123...",
  "certified_at": "2025-10-07T15:30:00.000Z"
}
```

---

**Option B : Utiliser "Wait for Certification" (automatique)**
```
TU PEUX modifier le workflow pour ajouter un node :

Node : PhotoCertif - Wait for Certification
Config :
  - Storage ID: {{ $json.storage_id }}
  - Polling Interval: 300 secondes (5 minutes)
  - Max Wait Time: 86400 secondes (24 heures)

Ce node va :
✅ Vérifier le statut toutes les 5 minutes
✅ Attendre que tu complètes le paiement
✅ Retourner automatiquement quand status = "certified"
⚠️ MAIS bloque l'exécution du workflow pendant l'attente
```

---

## 📊 Récapitulatif : Qui Fait Quoi ?

### **🤖 n8n GÈRE (automatique)** :

| Étape | Action | Appel API |
|-------|--------|-----------|
| 1️⃣ Get Pricing | Récupère le prix CHECKHC | `GET /api/pricing/service?type=docs` |
| 2️⃣ Upload | Upload le document sur PhotoCertif | `POST /api/storage/docs/upload/iv_route` |
| 3️⃣ Submit Certification | Soumet le formulaire de certification | `POST /api/storage/docs/certify/iv_route` |
| 4️⃣ Check Status | Vérifie le statut du document | `GET /api/storage/docs/status/iv_route` |

**Durée** : ~5-10 secondes

---

### **👤 TOI DOIS (manuel)** :

| Étape | Action | Où |
|-------|--------|-----|
| 0️⃣ Préparation | Encoder le PDF en base64 | Ton ordinateur |
| 0️⃣ Configuration | Modifier "Test Data" dans n8n | Interface n8n |
| 0️⃣ Exécution | Cliquer "Test workflow" | Interface n8n |
| 5️⃣ Navigation | Ouvrir l'URL de certification | Navigateur web |
| 6️⃣ Connexion | Connecter ton wallet Solana | Page PhotoCertif |
| 7️⃣ Paiement | Créer le NFT (payer en CHECKHC) | Page PhotoCertif |

**Durée** : ~2-3 minutes

---

### **🔧 PhotoCertif GÈRE (automatique après paiement)** :

| Étape | Action | Technologie |
|-------|--------|-------------|
| 💳 Paiement | Vérifie et traite le paiement CHECKHC | Solana blockchain |
| 📤 Métadonnées | Upload métadonnées NFT sur IPFS | Pinata |
| 🎨 NFT Mint | Crée le NFT sur Solana | Metaplex |
| 📮 Transfert | Transfère le NFT à ton wallet | Solana blockchain |
| 💾 Base de données | Met à jour le statut | PostgreSQL/Prisma |

**Durée** : ~30-60 secondes

---

## 🎯 Points Importants

### **✅ Ce que n8n fait BIEN** :
- Automatise les appels API répétitifs
- Gère l'authentification (API Key)
- Formate les requêtes correctement
- Récupère et affiche les résultats
- Permet de réutiliser le workflow facilement

### **❌ Ce que n8n NE PEUT PAS faire** :
- Connecter un wallet Solana (sécurité)
- Signer des transactions blockchain (nécessite wallet)
- Payer en crypto (nécessite wallet + approbation humaine)
- Créer des NFT directement (nécessite paiement d'abord)

### **💡 Pourquoi cette architecture ?** :
```
Raison de sécurité :
- Les transactions blockchain nécessitent une signature privée
- n8n ne peut PAS (et ne DOIT PAS) avoir accès à ta clé privée
- Le paiement et la création NFT doivent être approuvés manuellement
- C'est une protection contre les transactions non autorisées
```

---

## 🔄 Scénario d'Usage Réel

### **Cas d'usage : Certification de 10 contrats**

**Sans n8n** : 
```
❌ Pour chaque contrat :
1. Ouvrir PhotoCertif manuellement
2. Upload le PDF manuellement
3. Remplir le formulaire manuellement
4. Payer et créer le NFT

Total : ~30-40 minutes pour 10 contrats
```

**Avec n8n** :
```
✅ Phase automatique :
1. Préparer les 10 PDF encodés
2. Créer un workflow avec loop sur les 10 fichiers
3. Lancer le workflow → n8n upload et soumet tout automatiquement
4. Récupérer les 10 URLs de certification

✅ Phase manuelle :
5. Ouvrir chaque URL (peut être fait en masse)
6. Connecter le wallet une fois
7. Approuver les 10 paiements

Total : ~10-15 minutes pour 10 contrats
```

**Gain** : ~50% de temps économisé + processus plus fiable

---

## 📞 Ressources

**Workflows** :
- `workflow-docs-certification.json` - Import ce fichier dans n8n

**Documentation** :
- `WORKFLOWS_README.md` - Quick start
- `WORKFLOWS_IMPORT_GUIDE.md` - Guide complet
- `N8N_INTEGRATION_GUIDE.md` - Documentation technique

**APIs PhotoCertif** :
- `GET /api/pricing/service?type=docs`
- `POST /api/storage/docs/upload/iv_route`
- `POST /api/storage/docs/certify/iv_route`
- `GET /api/storage/docs/status/iv_route`

---

## ✅ Checklist Complète

**Avant de commencer** :
- [ ] n8n installé et fonctionnel
- [ ] Package n8n-nodes-photocertif v1.0.1 installé
- [ ] Credentials PhotoCertif API configurées
- [ ] API Key PhotoCertif récupérée

**Pour chaque certification** :
- [ ] Document encodé en base64
- [ ] Workflow importé dans n8n
- [ ] Test Data modifiées
- [ ] Workflow exécuté
- [ ] URL de certification récupérée
- [ ] Page ouverte dans le navigateur
- [ ] Wallet connecté
- [ ] Paiement effectué
- [ ] NFT créé ✅

---

**Tu es prêt ! 🚀**
