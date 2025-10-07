# 🚀 Quick Start - PhotoCertif n8n Node

## 📦 Installation (5 minutes)

### **1. Installer le Package**

```bash
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz
```

### **2. Redémarrer n8n**

```bash
# Arrêter n8n
pkill -f n8n

# Démarrer n8n
n8n start
```

---

## 🔑 Configuration (2 minutes)

### **Credential 1 : PhotoCertif API**

```
n8n → Settings → Credentials → + New Credential
```

1. Chercher : **"PhotoCertif API"**
2. Remplir :
   - **URL** : `https://localhost` (dev) ou `https://app2.photocertif.com` (prod)
   - **API Key** : `pk_live_xxxxx` (depuis PhotoCertif → My Account → API Keys)
3. **Save**

---

### **Credential 2 : Solana Wallet** ⭐ NOUVEAU

```
n8n → Settings → Credentials → + New Credential
```

1. Chercher : **"Solana Wallet"**
2. Remplir :
   - **Private Key** : `5Kj9x7Hs...` (ta clé privée base58)
   - **Network** : `Mainnet` (par défaut)
   - **RPC URL** : `https://api.mainnet-beta.solana.com` (ou ton RPC privé)
3. **Save**

**💡 Besoin d'une clé privée ?**

```bash
# Option rapide : Créer un nouveau wallet
cd /home/greg/n8n-nodes-photocertif
node -e "
const {Keypair} = require('@solana/web3.js');
const bs58 = require('bs58');
const k = Keypair.generate();
console.log('Adresse:', k.publicKey.toString());
console.log('Clé privée:', bs58.encode(k.secretKey));
"
```

**💰 Alimenter en CHECKHC :**
- Aller sur https://jup.ag/swap/SOL-CHECKHC
- Acheter 500-1000 CHECKHC (~$3-5)
- Envoyer à l'adresse du wallet n8n

---

## 🎯 Import du Workflow (1 minute)

### **Workflow Automatique B2B**

```
n8n → Workflows → Import from File
```

Sélectionner :
- **Documents** : `workflow-docs-automated-b2b.json`
- **Images/Art** : `workflow-image2-automated-b2b.json`

---

## ✏️ Configuration du Workflow (1 minute)

### **1. Assigner les Credentials**

**Pour chaque node PhotoCertif** (1. Get Pricing, 2. Upload, 4. Certify) :
- Cliquer sur le node
- Section "Credentials" → Sélectionner **"PhotoCertif API"**

**Le node "3. Pay with CHECKHC"** utilise automatiquement **"Solana Wallet"** ✅

---

### **2. Modifier les Données d'Input**

Cliquer sur le node **"Input Data"** :

**Pour Documents** :
```javascript
{
  fileBase64: "data:application/pdf;base64,..." // TON PDF encodé
  title: "Mon Document Test"
  description: "Test automation"
  cert_name: "TestDoc2025"
  cert_symbol: "TEST"
  cert_description: "Test certification"
  cert_owner: "Test Company"
}
```

**Pour Images** :
```javascript
{
  imageBase64: "data:image/jpeg;base64,..." // TON IMAGE encodée
  title: "Mon Art 2025"
  description: "Test art certification"
  cert_name: "ArtTest2025"
  cert_symbol: "ART"
  cert_description: "Test art certification"
  cert_owner: "Artist Name"
}
```

**💡 Encoder un fichier** :
```bash
# PDF
base64 -w 0 document.pdf
# Ajouter le préfixe : data:application/pdf;base64,<résultat>

# Image
base64 -w 0 image.jpg
# Ajouter le préfixe : data:image/jpeg;base64,<résultat>
```

---

## ▶️ Test du Workflow (30 secondes)

1. **Vérifier** :
   - ✅ Credentials assignées
   - ✅ Input Data modifiées
   - ✅ Wallet alimenté en CHECKHC (minimum 200 CHECKHC)

2. **Cliquer** sur **"Test workflow"**

3. **Observer** l'exécution :
   ```
   ⏳ 1. Get Pricing → Récupération du prix...
   ⏳ 2. Upload → Upload du fichier...
   ⏳ 3. Pay with CHECKHC → Paiement automatique... 💰
   ⏳ 4. Certify with Payment → Création NFT...
   ✅ Terminé !
   ```

4. **Consulter les résultats** dans le node **"Results Summary"** :
   ```
   💰 Prix payé
   📄 Storage ID
   💳 Transaction signature
   🎨 NFT Mint address
   ✅ Owner wallet
   ```

---

## 🎉 C'est Fait !

**Tu as maintenant** :
- ✅ Un workflow 100% automatique
- ✅ Paiement CHECKHC automatique depuis n8n
- ✅ NFT créé côté serveur PhotoCertif
- ✅ ZÉRO intervention humaine

**Durée totale** : ~30-60 secondes par certification

---

## 📚 Documentation Complète

**Besoin d'aide ?** Consulte :

1. **SOLANA_WALLET_SETUP.md** - Configuration Solana détaillée
2. **AUTOMATED_B2B_GUIDE.md** - Guide B2B complet
3. **WORKFLOWS_IMPORT_GUIDE.md** - Import et troubleshooting
4. **N8N_INTEGRATION_GUIDE.md** - Documentation technique

---

## 🛠️ Troubleshooting Rapide

### **"Cannot find credential 'solanaWallet'"**
→ Créer la credential "Solana Wallet" dans Settings → Credentials

### **"Insufficient CHECKHC balance"**
→ Acheter plus de CHECKHC et envoyer au wallet n8n

### **"Invalid private key format"**
→ Vérifier que la clé est au format base58 (87-88 caractères)

### **"Transaction failed"**
→ Utiliser un RPC privé (Helius, QuickNode) ou attendre et réessayer

---

## 🎯 Prochaines Étapes

**Pour production** :
1. Utiliser un RPC privé pour meilleure performance
2. Augmenter le balance CHECKHC (5000-10000 tokens)
3. Configurer un webhook pour déclencher automatiquement
4. Monitorer les transactions sur Solscan

**Workflows avancés** :
- Loop sur plusieurs fichiers
- Intégration avec Google Drive / Dropbox
- Notifications par email après certification
- Dashboard de suivi

---

## 📞 Support

**Questions ?** 
- GitHub Issues : https://github.com/checkhc/n8n-nodes-photocertif/issues
- Email : contact@checkhc.com

**Contributions** : Pull Requests welcome ! 🙌

---

**Version** : 2.0.0  
**Dernière mise à jour** : 2025-10-07  
**License** : MIT
