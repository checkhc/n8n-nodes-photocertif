# 🔑 Configuration Wallet Solana - MÉTHODE SIMPLIFIÉE

## ✅ **Nouvelle Méthode : Credential Dédiée "Solana Wallet"**

Maintenant tu as une credential dédiée dans n8n, exactement comme pour l'API PhotoCertif !

---

## 📋 **Étapes Simples**

### **1. Ouvrir n8n**
```
http://localhost:5678
```

### **2. Créer la Credential Solana Wallet**

1. **Cliquer** sur l'icône ⚙️ **"Settings"** (en haut à gauche)

2. **Cliquer** sur **"Credentials"**

3. **Cliquer** sur **"+ New Credential"** (bouton bleu)

4. **Dans la barre de recherche**, taper : `Solana`

5. **Sélectionner** : **"Solana Wallet"** ⭐

6. **Remplir le formulaire** :

```
┌─────────────────────────────────────────────────────┐
│  Solana Wallet                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Private Key: *                                      │
│  [5Kj9x7Hs...Ab3d                           ]       │
│   ↑ Ta clé privée Solana en format base58          │
│                                                      │
│  Network:                                            │
│  [Mainnet                           ▼]              │
│                                                      │
│  RPC URL:                                            │
│  [https://api.mainnet-beta.solana.com      ]       │
│   ↑ Optionnel : Utilise un RPC privé (Helius, etc.)│
│                                                      │
│  ℹ️ How to get your private key?                    │
│                                                      │
│  From Phantom Wallet:                                │
│  1. Open Phantom → Settings → Security & Privacy    │
│  2. Click "Export Private Key"                       │
│  3. Copy the private key (base58 format)            │
│                                                      │
│  Create a new wallet:                                │
│  Use Solana CLI: solana-keygen new                  │
│                                                      │
│  ⚠️ Security:                                        │
│  • Use a dedicated wallet for n8n                   │
│  • Store only necessary CHECKHC tokens              │
│  • Never share your private key                     │
│                                                      │
│  [Cancel]              [Save] ← Cliquer ici         │
└─────────────────────────────────────────────────────┘
```

7. **Cliquer** sur **"Save"**

---

## 🔐 **Comment Obtenir ta Clé Privée ?**

### **Option A : Depuis Phantom Wallet**

1. Ouvrir Phantom
2. Cliquer sur **☰** (menu en haut à droite)
3. **Settings** → **Security & Privacy**
4. **Export Private Key**
5. Entrer ton mot de passe
6. **Copier la clé privée** (format base58)

### **Option B : Depuis Solflare**

1. Ouvrir Solflare
2. **Settings** → **Account**
3. **Export Private Key**
4. Copier la clé

### **Option C : Créer un Nouveau Wallet Dédié** (recommandé)

**Via Solana CLI** :
```bash
# Installer Solana CLI (si pas déjà fait)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Créer un nouveau wallet
solana-keygen new --outfile ~/solana-n8n-wallet.json

# Afficher l'adresse publique
solana-keygen pubkey ~/solana-n8n-wallet.json

# Afficher la clé privée (base58)
solana-keygen pubkey ~/solana-n8n-wallet.json --output json
# Puis convertir avec :
# cat ~/solana-n8n-wallet.json | python3 -c "import sys,json,base58; print(base58.b58encode(bytes(json.load(sys.stdin))).decode())"
```

**Via Node.js** (plus simple) :
```bash
cd /home/greg/n8n-nodes-photocertif
node -e "
const {Keypair} = require('@solana/web3.js');
const bs58 = require('bs58');
const k = Keypair.generate();
console.log('Public Address:', k.publicKey.toString());
console.log('Private Key (base58):', bs58.encode(k.secretKey));
console.log('');
console.log('⚠️ SAVE THIS PRIVATE KEY IN A SAFE PLACE!');
"
```

---

## 💰 **Alimenter le Wallet en CHECKHC**

**Une fois ton wallet créé/configuré** :

### **1. Acheter des CHECKHC**

**Via Jupiter Swap** (recommandé) :
```
1. Aller sur : https://jup.ag/swap/SOL-CHECKHC
2. Connecter ton wallet Phantom/Solflare
3. Swap SOL → CHECKHC
4. Montant recommandé :
   - Test : 500-1000 CHECKHC (~$3-5)
   - Production : 5000-10000 CHECKHC (~$30-50)
```

**Via Raydium** :
```
https://raydium.io/swap/
```

### **2. Transférer vers ton Wallet n8n**

Si tu as créé un wallet dédié pour n8n :
```
1. Copier l'adresse publique de ton wallet n8n
2. Dans Phantom/Solflare, envoyer des CHECKHC à cette adresse
3. Vérifier sur Solscan :
   https://solscan.io/account/<ton-adresse>
```

---

## 🎯 **Utilisation dans le Workflow**

### **Assigner la Credential**

**Les workflows automatiques utilisent déjà la bonne credential !**

Mais si tu veux vérifier :

1. **Ouvrir le workflow** `PhotoCertif - Automated B2B Certification (media/docs)`

2. **Les nodes PhotoCertif (1, 2, 4)** utilisent déjà `PhotoCertif API` ✅

3. **Le node "3. Pay with CHECKHC"** (Code JavaScript) récupère automatiquement la credential `Solana Wallet` via :
   ```javascript
   const credentials = await this.getCredentials('solanaWallet');
   ```

4. **Aucune modification nécessaire** ! 🎉

---

## ✅ **Vérification Avant de Tester**

- [ ] Credential "PhotoCertif API" créée et configurée
- [ ] Credential "Solana Wallet" créée et configurée
- [ ] Clé privée au format base58 (87-88 caractères)
- [ ] Network sélectionné : Mainnet
- [ ] RPC URL configuré (ou laissé par défaut)
- [ ] Wallet alimenté en CHECKHC (minimum 200 CHECKHC)
- [ ] Balance vérifié sur Solscan

---

## 🚀 **Test du Workflow**

1. **Ouvrir le workflow** : `PhotoCertif - Automated B2B Certification (media/docs)`

2. **Modifier "Input Data"** avec tes propres données :
   ```javascript
   {
     fileBase64: "data:application/pdf;base64,..." // Ton PDF
     title: "Mon Document Test"
     description: "Test automation"
     cert_name: "TestDoc2025"
     cert_symbol: "TEST"
     cert_description: "Test certification"
     cert_owner: "Test Company"
   }
   ```

3. **Vérifier les credentials assignées** :
   - Node "1. Get Pricing" → PhotoCertif API
   - Node "2. Upload" → PhotoCertif API
   - Node "4. Certify" → PhotoCertif API
   - (Le node "3. Pay" utilise automatiquement Solana Wallet)

4. **Cliquer** sur **"Test workflow"**

5. **Observer l'exécution** :
   ```
   ✅ 1. Get Pricing → Prix CHECKHC récupéré
   ✅ 2. Upload → Document uploadé
   ✅ 3. Pay → Paiement automatique effectué 🎉
   ✅ 4. Certify → NFT créé et transféré
   ```

6. **Consulter les résultats** dans le node "Results Summary"

---

## 🛠️ **Troubleshooting**

### **Erreur : "Cannot find credential 'solanaWallet'"**

**Cause** : La credential n'est pas créée ou mal nommée

**Solution** :
1. Vérifier dans Settings → Credentials
2. Chercher "Solana Wallet"
3. Si absente, créer la credential comme expliqué ci-dessus
4. Redémarrer n8n si nécessaire

---

### **Erreur : "Invalid private key format"**

**Cause** : La clé n'est pas au format base58

**Solution** :
- Format attendu : `5Kj9x7HsAb3d...` (87-88 caractères)
- PAS de format JSON : `[123, 45, 67, ...]`
- PAS de format hex : `0x123abc...`

**Convertir JSON → base58** :
```javascript
const bs58 = require('bs58');
const jsonKey = [123, 45, 67, ...]; // Ton array
const base58Key = bs58.encode(Buffer.from(jsonKey));
console.log(base58Key);
```

---

### **Erreur : "Insufficient CHECKHC balance"**

**Solution** :
1. Vérifier le balance sur Solscan
2. Acheter/transférer plus de CHECKHC
3. Attendre confirmation (quelques secondes)
4. Réessayer

---

### **Erreur : "Transaction failed"**

**Causes possibles** :
- RPC surchargé
- Network congestion
- Balance insuffisant pour les frais

**Solutions** :
1. **Utiliser un RPC privé** (Helius, QuickNode) :
   ```
   https://rpc.helius.xyz/?api-key=<ta-clé>
   https://your-endpoint.quiknode.pro/...
   ```

2. **Attendre et réessayer** (congestion réseau)

3. **Vérifier le SOL** pour les frais (minimum 0.01 SOL requis)

---

## 🎉 **Avantages de cette Méthode**

### **Avant (Generic Credentials)** :
- ❌ Pas intuitif
- ❌ Difficile à trouver
- ❌ Pas de validation
- ❌ Pas de guide intégré

### **Maintenant (Credential Dédiée)** :
- ✅ Interface claire et dédiée
- ✅ Guide intégré directement dans n8n
- ✅ Validation du format de clé
- ✅ Configuration réseau incluse
- ✅ Professionnel et standard

---

## 📞 **Besoin d'Aide ?**

**Si tu bloques** :
1. Vérifie que n8n est bien redémarré après l'installation
2. Consulte les logs n8n : `~/.n8n/logs/`
3. Vérifie que les deux credentials sont bien créées
4. Teste d'abord avec un petit montant (200 CHECKHC)

---

**Version** : 2.0.0 - Credential Dédiée  
**Date** : 2025-10-07  
**Package** : n8n-nodes-photocertif v1.0.1
