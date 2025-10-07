# 🤖 Guide Complet - Workflows Automatisés B2B

## 🎯 Vue d'Ensemble

**Ces workflows sont 100% AUTOMATIQUES** - Aucune intervention humaine !

```
Input Data → Upload → PAIEMENT AUTOMATIQUE → NFT MINTÉ CÔTÉ SERVEUR → Terminé
   (toi)      (n8n)         (n8n)                 (PhotoCertif)        (60s)
```

**Différence avec les workflows manuels** :
- ❌ Workflows manuels : Upload → URL → TOI paies manuellement → NFT
- ✅ Workflows automatiques : Upload → n8n paie automatiquement → NFT

---

## 📦 Workflows Disponibles

### **1. workflow-docs-automated-b2b.json**
**Type** : Document Certification (media/docs)  
**Prix** : ~175 CHECKHC (~$1 USD)  
**Durée** : ~30-60 secondes  
**Use case** : Certification automatique de documents (contrats, PDF, etc.)

### **2. workflow-image2-automated-b2b.json**
**Type** : Art Certification (media/image2)  
**Prix** : ~525 CHECKHC (~$3 USD)  
**Durée** : ~60-90 secondes  
**Features** :
- ✅ Analyse IA (4 niveaux)
- ✅ Stockage permanent Arweave
- ✅ PRNU camera fingerprint
- ✅ Watermark certification  
**Use case** : Certification art, photos, NFT collections

---

## 🔧 Configuration Requise

### **Étape 1 : Credentials PhotoCertif API**

**Ces credentials existent déjà** (créées précédemment)

Si non créées :
1. Dans n8n : Settings → Credentials → New Credential
2. Chercher "PhotoCertif API"
3. Remplir :
   - **PhotoCertif URL** : `https://localhost` (dev) ou `https://app2.photocertif.com` (prod)
   - **API Key** : `pk_live_xxxxxxxxxxxxx` (depuis PhotoCertif → My Account → API Keys)
4. Save

---

### **Étape 2 : Credentials Solana Wallet** ⭐ NOUVEAU

**C'est ici qu'on stocke la clé privée pour le paiement automatique !**

#### **A. Récupérer ta clé privée Solana**

**Si tu as Phantom/Solflare** :
1. Ouvrir ton wallet
2. Settings → Reveal Secret Recovery Phrase (ou Export Private Key)
3. **ATTENTION** : Copie la clé privée (format base58)

**Format attendu** : 
```
Clé privée base58 : 5Kj9x7Hs...Ab3d (chaîne de 87-88 caractères)
```

**⚠️ SÉCURITÉ CRITIQUE** :
- Cette clé donne un accès TOTAL à ton wallet
- Ne JAMAIS la partager
- Utilise un wallet dédié pour n8n (pas ton wallet principal)
- Ce wallet doit contenir uniquement les CHECKHC nécessaires

---

#### **B. Créer les Credentials dans n8n**

**Option 1 : Créer un nouveau type de credential "Solana Wallet"** (recommandé)

1. **Créer le fichier de credentials** :

```bash
cd /home/greg/.n8n/nodes/node_modules/n8n-nodes-photocertif
mkdir -p credentials
```

2. **Créer** : `credentials/SolanaWallet.credentials.ts` :

```typescript
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SolanaWallet implements ICredentialType {
  name = 'solanaWallet';
  displayName = 'Solana Wallet';
  documentationUrl = 'https://docs.solana.com';
  properties: INodeProperties[] = [
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '5Kj9x7Hs...Ab3d',
      description: 'Solana wallet private key (base58 format)',
      required: true,
    },
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet-beta',
        },
        {
          name: 'Devnet',
          value: 'devnet',
        },
      ],
      default: 'mainnet-beta',
      description: 'Solana network to use',
    },
    {
      displayName: 'RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: 'https://api.mainnet-beta.solana.com',
      description: 'Solana RPC endpoint URL',
    },
  ];
}
```

3. **Mettre à jour** `package.json` :

```json
{
  "n8n": {
    "credentials": [
      "dist/credentials/PhotoCertifApi.credentials.js",
      "dist/credentials/SolanaWallet.credentials.js"
    ],
    "nodes": [
      "dist/nodes/PhotoCertif/PhotoCertif.node.js"
    ]
  }
}
```

4. **Compiler et réinstaller** :

```bash
cd /home/greg/n8n-nodes-photocertif
npm run build
npm pack
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz
sudo systemctl restart n8n
```

5. **Créer les credentials dans n8n** :
   - Settings → Credentials → New Credential
   - Chercher "Solana Wallet"
   - Remplir :
     - **Private Key** : Ta clé privée base58
     - **Network** : mainnet-beta
     - **RPC URL** : https://api.mainnet-beta.solana.com (ou ton RPC privé)
   - Save

---

**Option 2 : Utiliser Generic Credentials** (plus simple pour tester)

1. Dans n8n : Settings → Credentials → New Credential
2. Chercher "Generic Credentials"
3. Remplir :
   - **Name** : `Solana Wallet`
   - Ajouter un champ :
     - **Name** : `privateKey`
     - **Value** : Ta clé privée base58 (coché "Password" pour la masquer)
4. Save

⚠️ **Avec cette méthode**, tu devras modifier le code du workflow pour récupérer les credentials avec :
```javascript
const credentials = await this.getCredentials('genericCredential');
const privateKeyBase58 = credentials.privateKey;
```

---

#### **C. Alimenter le Wallet en CHECKHC**

**Ton wallet n8n doit avoir des CHECKHC pour payer !**

1. **Trouver l'adresse publique de ton wallet** :
   ```bash
   # Si tu as solana CLI
   solana-keygen pubkey <ta-clé-privée.json>
   
   # Ou dans Phantom/Solflare : voir ton adresse wallet
   ```

2. **Acheter/Transférer des CHECKHC** :
   - Utilise Jupiter Swap ou Raydium
   - Ou transfère depuis un autre wallet

3. **Montant recommandé** :
   - media/docs : 2000-5000 CHECKHC (~10-20 certifications)
   - media/image2 : 5000-10000 CHECKHC (~10-20 certifications)

4. **Vérifier le balance** :
   ```bash
   # Solscan
   https://solscan.io/account/<ton-adresse-wallet>
   
   # Ou via code dans le workflow (déjà inclus)
   ```

---

## 🚀 Utilisation des Workflows

### **Import dans n8n**

1. Ouvrir n8n : `http://localhost:5678`
2. Workflows → Import from File
3. Sélectionner :
   - `workflow-docs-automated-b2b.json` (pour documents)
   - `workflow-image2-automated-b2b.json` (pour images)
4. Le workflow s'ouvre

---

### **Configuration du Workflow**

#### **1. Assigner les Credentials**

**Pour chaque node PhotoCertif** :
- Cliquer sur le node
- Section "Credentials"
- Sélectionner "PhotoCertif API"

**Pour le node "3. Pay with CHECKHC"** :
- Cliquer sur le node
- Dans le code JavaScript, vérifier la ligne :
  ```javascript
  const credentials = await this.getCredentials('solanaWallet');
  ```
- Si tu utilises Generic Credentials, remplacer par :
  ```javascript
  const credentials = await this.getCredentials('genericCredential');
  ```

---

#### **2. Modifier les Données d'Entrée**

Cliquer sur le node **"Input Data"** et modifier :

**Pour media/docs** :
```javascript
{
  fileBase64: "data:application/pdf;base64,..." // Ton PDF encodé
  title: "Contract ABC 2025"
  description: "Official contract"
  cert_name: "ContractABC2025"
  cert_symbol: "CABC"
  cert_description: "Official certification"
  cert_owner: "Company ABC Inc"
}
```

**Pour media/image2** :
```javascript
{
  imageBase64: "data:image/jpeg;base64,..." // Ton image encodée
  title: "Digital Art 2025"
  description: "Original artwork"
  cert_name: "ArtCollection2025"
  cert_symbol: "ART"
  cert_description: "Certified artwork"
  cert_owner: "Art Gallery Inc"
}
```

---

#### **3. Tester le Workflow**

1. Cliquer sur **"Test workflow"** en haut à droite
2. Observer l'exécution node par node :
   - ✅ **1. Get Pricing** - Prix CHECKHC récupéré
   - ✅ **2. Upload** - Fichier uploadé, storage_id obtenu
   - ✅ **3. Pay with CHECKHC** - Paiement automatique, signature obtenue
   - ✅ **4. Certify with Payment** - NFT minté côté serveur
3. Consulter le **"Results Summary"** pour voir tous les détails

---

## 🔄 Flux Détaillé

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUX AUTOMATIQUE B2B                      │
└──────────────────────────────────────────────────────────────┘

1️⃣ Input Data (TOI)
   └─► Préparer les données du document/image

2️⃣ Get Pricing (n8n → PhotoCertif API)
   ├─► GET /api/pricing/service?type=docs
   └─► Reçoit : price_checkhc, payment_wallet

3️⃣ Upload Document/Image (n8n → PhotoCertif API)
   ├─► POST /api/storage/{type}/upload/iv_route
   ├─► Envoie : file base64, title, description
   └─► Reçoit : storage_id, hash

4️⃣ Pay with CHECKHC (n8n + Solana)
   ├─► Charge la clé privée depuis credentials
   ├─► Connecte à Solana RPC
   ├─► Récupère les Associated Token Accounts
   ├─► Vérifie le balance CHECKHC
   ├─► Crée la transaction de transfert
   ├─► Signe la transaction avec la clé privée
   ├─► Envoie la transaction à Solana
   ├─► Attend la confirmation
   └─► Retourne : payment_signature

5️⃣ Certify with Payment (n8n → PhotoCertif API)
   ├─► POST /api/storage/{type}/certify-with-payment
   ├─► Envoie : storage_id, payment_signature, NFT metadata
   └─► PhotoCertif FAIT AUTOMATIQUEMENT :
       ├─► Vérifie le paiement on-chain
       ├─► Upload métadonnées IPFS/Arweave
       ├─► Mint NFT sur Solana (côté serveur)
       ├─► Transfère NFT au wallet qui a payé
       └─► Update database status = "certified"

6️⃣ Résultat
   └─► NFT créé et transféré automatiquement ! ✅
```

---

## 💰 Détails du Paiement Automatique

### **Code JavaScript dans le node "3. Pay with CHECKHC"**

Le code fait :
1. **Charge les credentials Solana**
2. **Connecte au RPC Solana**
3. **Récupère les Associated Token Accounts** (ATA) :
   - ATA du payer (ton wallet n8n)
   - ATA du recipient (wallet PhotoCertif)
4. **Vérifie le balance CHECKHC**
5. **Crée la transaction SPL Token Transfer** :
   - Montant : `price_checkhc * 1000000` (6 décimales)
   - De : Ton ATA
   - À : ATA PhotoCertif
6. **Signe et envoie la transaction**
7. **Attend la confirmation**
8. **Retourne la signature**

### **Sécurité**

- ✅ La clé privée est stockée dans n8n credentials (chiffrées)
- ✅ La clé privée ne quitte JAMAIS n8n
- ✅ Chaque transaction est loggée dans la console n8n
- ✅ Balance vérifié avant chaque paiement
- ⚠️ Utilise un wallet dédié (pas ton wallet principal)

---

## 📊 Résultats Attendus

### **Node "1. Get Pricing"**
```json
{
  "success": true,
  "type": "docs",
  "price_checkhc": 175.48,
  "price_usd": 1,
  "checkhc_mint": "5tpkr...49uau",
  "payment_wallet": "C6bK...hESFg",
  "network": "mainnet-beta"
}
```

### **Node "2. Upload"**
```json
{
  "storage_id": "iv_1728316892508_wp776fb",
  "status": "uploaded",
  "hash": "abc123def456...",
  "message": "File uploaded successfully"
}
```

### **Node "3. Pay with CHECKHC"**
```json
{
  "payment_signature": "5kHKG789...Ab12",
  "payment_amount": 175.48,
  "payment_wallet": "C6bK...hESFg",
  "payer_wallet": "Dt5g...Kx9m",
  "storage_id": "iv_1728316892508_wp776fb",
  "confirmed": true,
  "confirmation_url": "https://solscan.io/tx/5kHKG789..."
}
```

### **Node "4. Certify with Payment"**
```json
{
  "success": true,
  "status": "certified",
  "storage_id": "iv_1728316892508_wp776fb",
  "nft_mint": "FxYz...Ab12",
  "transaction_signature": "abc123...def456",
  "owner_wallet": "Dt5g...Kx9m",
  "message": "NFT minted and transferred successfully",
  // Pour image2 uniquement :
  "ai_source": "HUMAN_CREATED",
  "prnu_score": 0.85
}
```

---

## 🛠️ Troubleshooting

### **Erreur : "Insufficient CHECKHC balance"**

**Solution** :
1. Vérifier le balance du wallet n8n sur Solscan
2. Acheter/transférer plus de CHECKHC
3. Attendre que le balance soit confirmé

---

### **Erreur : "Cannot find credential 'solanaWallet'"**

**Solution** :
- Si tu n'as pas créé les credentials Solana Wallet personnalisées
- Utilise Generic Credentials à la place
- Modifie le code du workflow :
  ```javascript
  // Remplacer
  const credentials = await this.getCredentials('solanaWallet');
  // Par
  const credentials = await this.getCredentials('genericCredential');
  ```

---

### **Erreur : "Transaction failed"**

**Causes possibles** :
1. **RPC surchargé** : Utilise un RPC privé (Helius, QuickNode)
2. **Network congestion** : Réessaye plus tard
3. **Balance insuffisant** : Vérifie le balance
4. **Clé privée invalide** : Vérifie le format base58

**Solution** :
- Dans le code du workflow, ajoute un retry :
  ```javascript
  // Envoie avec retry
  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    { 
      skipPreflight: false, 
      maxRetries: 3 
    }
  );
  ```

---

### **Erreur : "Payment verification failed"**

**Cause** : PhotoCertif ne trouve pas la transaction

**Solution** :
1. Vérifie la signature sur Solscan
2. Attends quelques secondes et réessaye
3. Vérifie que le paiement est bien arrivé au bon wallet

---

## 🎯 Cas d'Usage Réels

### **Scénario 1 : Certification de 100 Contrats**

**Sans automation** :
- Temps : ~5 heures (3 min par contrat)
- Risque d'erreur : Élevé

**Avec ce workflow** :
- Setup : Créer un workflow avec boucle sur 100 fichiers
- Temps : ~1 heure (30s par contrat)
- Risque d'erreur : Très faible
- Coût : 100 × 175 CHECKHC = 17,500 CHECKHC (~$100)

---

### **Scénario 2 : Galerie d'Art - 50 Œuvres**

**Sans automation** :
- Temps : ~4 heures (5 min par œuvre)
- Analyse IA manuelle : Fastidieux

**Avec ce workflow** :
- Setup : Loop sur 50 images
- Temps : ~1.5 heures (60s par œuvre avec analyse IA)
- Analyse IA : Automatique
- Coût : 50 × 525 CHECKHC = 26,250 CHECKHC (~$150)
- Features : PRNU, AI, Arweave permanent

---

## 📦 Résumé des Fichiers

```
/home/greg/n8n-nodes-photocertif/
├── workflow-docs-automated-b2b.json       ← Workflow docs automatique
├── workflow-image2-automated-b2b.json     ← Workflow image2 automatique
├── AUTOMATED_B2B_GUIDE.md                 ← Ce guide complet
└── credentials/
    └── SolanaWallet.credentials.ts        ← À créer (optionnel)
```

---

## ✅ Checklist Avant de Commencer

- [ ] n8n installé et fonctionnel
- [ ] Package n8n-nodes-photocertif v1.0.1 installé
- [ ] Credentials PhotoCertif API créées
- [ ] Credentials Solana Wallet créées (ou Generic)
- [ ] Clé privée Solana copiée (format base58)
- [ ] Wallet n8n alimenté en CHECKHC
- [ ] Balance CHECKHC vérifié sur Solscan
- [ ] Workflow importé dans n8n
- [ ] Credentials assignées aux nodes
- [ ] Input Data modifiées avec tes données
- [ ] Prêt à lancer ! 🚀

---

## 🎉 Prêt pour l'Automation B2B !

**Tu as maintenant** :
1. ✅ Un workflow 100% automatique
2. ✅ Paiement CHECKHC depuis n8n
3. ✅ NFT minté côté serveur PhotoCertif
4. ✅ ZÉRO intervention humaine

**Prochaine étape** : Tester avec un document/image réel !

---

**Questions ? Problèmes ?** Consulte le Troubleshooting ou check les logs n8n.

**Version** : 1.0.0 B2B Automated  
**Date** : 2025-10-07
