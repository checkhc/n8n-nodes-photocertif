# 📝 Changelog - Version 2.0

## 🎉 **Nouvelle Fonctionnalité Majeure**

### **Credential Dédiée "Solana Wallet"**

**Date** : 2025-10-07

---

## ✨ **Nouveautés**

### **1. Nouveau Type de Credential : Solana Wallet**

**Fichier** : `credentials/SolanaWallet.credentials.ts`

**Fonctionnalités** :
- ✅ Interface dédiée pour configurer le wallet Solana
- ✅ Champs spécifiques : Private Key, Network, RPC URL
- ✅ Guide intégré directement dans l'interface n8n
- ✅ Validation du format de clé privée
- ✅ Sélection du réseau (Mainnet/Devnet/Testnet)
- ✅ Configuration RPC personnalisée

**Champs disponibles** :
```typescript
- Private Key (string, password, required)
  * Format base58 attendu
  * Masqué pour la sécurité

- Network (options, required)
  * Mainnet (par défaut)
  * Devnet
  * Testnet

- RPC URL (string, required)
  * Défaut : https://api.mainnet-beta.solana.com
  * Personnalisable (Helius, QuickNode, etc.)

- Info Notice (guide intégré)
  * Comment obtenir la clé privée depuis Phantom
  * Comment créer un nouveau wallet
  * Conseils de sécurité
```

---

### **2. Node PhotoCertif Mis à Jour**

**Modification** : `nodes/PhotoCertif/PhotoCertif.node.ts`

**Changement** :
```typescript
credentials: [
  {
    name: 'photoCertifApi',
    required: true,        // Obligatoire
  },
  {
    name: 'solanaWallet',  // ⭐ NOUVEAU
    required: false,       // Optionnel (uniquement pour workflows automatiques)
  },
]
```

**Impact** :
- Les workflows manuels n'ont pas besoin de Solana Wallet
- Les workflows automatiques utilisent automatiquement Solana Wallet
- Interface n8n affiche maintenant 2 sections de credentials

---

### **3. Package.json Mis à Jour**

**Ajout de dépendances** :
```json
"dependencies": {
  "@solana/spl-token": "^0.3.9",  // ⭐ NOUVEAU
  "@solana/web3.js": "^1.87.6",
  "axios": "^1.6.0",
  "bs58": "^5.0.0",
  "form-data": "^4.0.0"
}
```

**Ajout de credentials** :
```json
"n8n": {
  "credentials": [
    "dist/credentials/PhotoCertifApi.credentials.js",
    "dist/credentials/SolanaWallet.credentials.js"  // ⭐ NOUVEAU
  ]
}
```

---

## 📚 **Documentation Ajoutée**

### **Nouveaux Guides** :

1. **SOLANA_WALLET_SETUP.md** (7.2K)
   - Guide complet de configuration
   - Étapes illustrées
   - Troubleshooting détaillé

2. **QUICK_SETUP_CREDENTIALS.md** (5.8K)
   - Guide rapide pour démarrer
   - Méthodes alternatives

---

## 🔄 **Migration depuis Generic Credentials**

### **Avant (v1.0)** :
```
Settings → Credentials → Generic Credentials
  Name: Solana Wallet
  Field: privateKey = <clé>
```

### **Maintenant (v2.0)** :
```
Settings → Credentials → Solana Wallet  ⭐
  Private Key: <clé>
  Network: Mainnet
  RPC URL: https://api.mainnet-beta.solana.com
```

**Migration** : Automatique - Rien à faire !
- Les anciens workflows continuent de fonctionner
- Tu peux créer la nouvelle credential en parallèle
- Supprimer l'ancienne Generic Credential quand tu veux

---

## 🎯 **Avantages UX**

### **Comparaison** :

| Aspect | v1.0 (Generic) | v2.0 (Dédiée) |
|--------|----------------|---------------|
| **Visibilité** | ❌ Caché dans "Generic" | ✅ "Solana Wallet" visible |
| **Guide** | ❌ Documentation externe | ✅ Guide intégré dans n8n |
| **Validation** | ❌ Aucune | ✅ Format vérifié |
| **Réseau** | ❌ Codé en dur | ✅ Sélectionnable |
| **RPC** | ❌ Codé en dur | ✅ Personnalisable |
| **Professionalisme** | ❌ Bricolage | ✅ Standard n8n |

---

## 🚀 **Installation**

### **Nouvelle Installation** :

```bash
cd /home/greg/n8n-nodes-photocertif
npm install
npm run build
npm pack
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz

# Redémarrer n8n
pkill -f n8n
n8n start
```

### **Mise à Jour depuis v1.0** :

```bash
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz

# Redémarrer n8n
pkill -f n8n
n8n start
```

---

## 📊 **Fichiers Modifiés/Ajoutés**

### **Code** :
- ✅ `credentials/SolanaWallet.credentials.ts` (nouveau)
- ✅ `nodes/PhotoCertif/PhotoCertif.node.ts` (modifié)
- ✅ `package.json` (modifié)

### **Documentation** :
- ✅ `SOLANA_WALLET_SETUP.md` (nouveau)
- ✅ `QUICK_SETUP_CREDENTIALS.md` (nouveau)
- ✅ `CHANGELOG_V2.md` (ce fichier)

### **Workflows** :
- ✅ Workflows automatiques compatibles out-of-the-box
- ✅ Aucune modification nécessaire

---

## ✅ **Checklist Post-Installation**

- [ ] Package installé dans `/home/greg/.n8n/nodes/`
- [ ] n8n redémarré
- [ ] Credential "Solana Wallet" visible dans Settings → Credentials
- [ ] Credential "Solana Wallet" créée et configurée
- [ ] Workflow importé et testé
- [ ] Paiement automatique fonctionnel

---

## 🔮 **Roadmap Future**

### **Version 2.1 (Prochaine)** :
- [ ] Ajout d'un test de connexion pour Solana Wallet
- [ ] Affichage du balance CHECKHC dans la credential
- [ ] Support multi-wallet (plusieurs credentials)
- [ ] Statistiques de transactions

### **Version 2.2** :
- [ ] Operation "checkBalance" dans le node
- [ ] Operation "getTransactionHistory"
- [ ] Dashboard intégré dans n8n

---

## 📞 **Support**

**Questions ?** Consulte :
1. `SOLANA_WALLET_SETUP.md` - Guide complet
2. `AUTOMATED_B2B_GUIDE.md` - Guide B2B
3. `WORKFLOWS_README.md` - Quick start

**Issues GitHub** :
https://github.com/checkhc/n8n-nodes-photocertif/issues

---

**Version** : 2.0.0  
**Date** : 2025-10-07  
**Auteur** : CheckHC Team  
**License** : MIT
