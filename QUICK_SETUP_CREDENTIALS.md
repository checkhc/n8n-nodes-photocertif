# 🔑 Configuration Rapide des Credentials Solana pour n8n

## ⚡ Option Rapide (Recommandée pour tester)

### **Utiliser les Generic Credentials**

C'est la méthode la plus simple, pas besoin de créer un nouveau type de credential !

#### **Étapes** :

1. **Dans n8n** : Ouvrir `http://localhost:5678`

2. **Aller dans** : `Settings` (⚙️ en haut à gauche) → `Credentials`

3. **Créer une nouvelle credential** : Cliquer sur `New Credential`

4. **Chercher** : Taper "Generic" dans la barre de recherche

5. **Sélectionner** : `Generic Credentials`

6. **Remplir** :
   ```
   Credential Name: Solana Wallet
   ```

7. **Ajouter un champ** : Cliquer sur `Add Field`
   ```
   Name: privateKey
   Value: <ta-clé-privée-solana-base58>
   Type: ☑️ Cocher "Password" pour la masquer
   ```

8. **Save**

---

## 🔐 Comment obtenir ta clé privée Solana ?

### **Si tu as Phantom Wallet** :

1. Ouvrir Phantom
2. Cliquer sur l'icône des 3 barres (menu)
3. `Settings` → `Security & Privacy`
4. `Export Private Key`
5. Entrer ton mot de passe
6. **Copier la clé privée** (format base58, commence souvent par un chiffre)

### **Si tu as Solflare** :

1. Ouvrir Solflare
2. `Settings` → `Account`
3. `Export Private Key`
4. Copier la clé

### **Si tu veux créer un nouveau wallet dédié** :

**Option A : Via Solana CLI**
```bash
# Installer Solana CLI si pas déjà fait
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Créer un nouveau wallet
solana-keygen new --outfile ~/solana-n8n-wallet.json

# Afficher la clé publique
solana-keygen pubkey ~/solana-n8n-wallet.json

# Afficher la clé privée (base58)
cat ~/solana-n8n-wallet.json
```

**Option B : Via un script Node.js**
```javascript
// create-wallet.js
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toString());
console.log('Private Key (base58):', bs58.encode(keypair.secretKey));
```

Exécuter :
```bash
cd /home/greg/n8n-nodes-photocertif
node create-wallet.js
```

---

## 💰 Alimenter le Wallet en CHECKHC

**Une fois ton wallet créé**, tu dois l'alimenter en CHECKHC :

1. **Récupérer l'adresse publique** de ton wallet

2. **Acheter des CHECKHC** via :
   - **Jupiter** : https://jup.ag/swap/SOL-CHECKHC
   - **Raydium** : https://raydium.io/swap/

3. **Montant recommandé** :
   - Pour tester : 500-1000 CHECKHC (~$3-5)
   - Pour production : 5000-10000 CHECKHC (~$30-50)

4. **Vérifier le balance** sur Solscan :
   ```
   https://solscan.io/account/<ton-adresse-wallet>
   ```

---

## 🔧 Modifier le Workflow pour utiliser Generic Credentials

**Si tu utilises Generic Credentials**, tu dois modifier le code du workflow :

### **Ouvrir le workflow dans n8n**

1. Cliquer sur le node **"3. Pay with CHECKHC"**

2. **Trouver cette ligne** (vers ligne 15) :
   ```javascript
   const credentials = await this.getCredentials('solanaWallet');
   ```

3. **Remplacer par** :
   ```javascript
   const credentials = await this.getCredentials('genericCredential');
   ```

4. **Save**

---

## ⚠️ Sécurité Importante

### **Recommandations** :

1. ✅ **Utilise un wallet dédié** pour n8n (pas ton wallet principal)
2. ✅ **Stocke seulement les CHECKHC nécessaires** (pas plus de 10000)
3. ✅ **Sauvegarde la clé privée** dans un endroit sûr (password manager)
4. ✅ **Ne partage JAMAIS ta clé privée**
5. ✅ **Les credentials n8n sont chiffrées** mais reste prudent

### **Pourquoi un wallet dédié ?**

```
Si ton wallet n8n contient :
- ❌ 100 SOL + 50000 CHECKHC = Risque élevé
- ✅ 0.1 SOL + 5000 CHECKHC = Risque limité

En cas de problème :
- Perte maximale limitée
- Wallet principal protégé
```

---

## ✅ Vérification Finale

**Avant de tester le workflow**, vérifie :

- [ ] Credentials "Solana Wallet" créées dans n8n
- [ ] Clé privée au format base58 (pas JSON)
- [ ] Clé privée marquée comme "Password" (masquée)
- [ ] Wallet alimenté en CHECKHC (au moins 200 CHECKHC)
- [ ] Balance vérifié sur Solscan
- [ ] Code du workflow modifié si utilisation Generic Credentials

---

## 🚀 Prêt à Tester !

**Maintenant tu peux** :

1. Ouvrir le workflow `PhotoCertif - Automated B2B Certification (media/docs)`
2. Modifier le node "Input Data" avec tes données
3. Assigner les credentials "PhotoCertif API" aux nodes PhotoCertif
4. Cliquer "Test workflow"
5. Observer le paiement automatique ! 🎉

---

## 🛠️ Troubleshooting

### **Erreur : "Cannot find credential 'genericCredential'"**

**Solution** : Vérifie que tu as bien créé une credential "Generic Credentials" et pas un autre type.

### **Erreur : "Invalid private key format"**

**Cause** : La clé n'est pas au format base58

**Solution** : 
- La clé doit être une chaîne de caractères (87-88 caractères)
- Format : `5Kj9x7Hs...Ab3d`
- PAS de format JSON : `[123, 45, 67, ...]`

**Convertir JSON vers base58** :
```javascript
const bs58 = require('bs58');
const jsonKey = [123, 45, 67, ...]; // Ton array JSON
const base58Key = bs58.encode(Buffer.from(jsonKey));
console.log(base58Key);
```

### **Erreur : "Insufficient CHECKHC balance"**

**Solution** : Achète plus de CHECKHC et envoie-les au wallet n8n

---

## 📞 Besoin d'Aide ?

**Si tu bloques** :
1. Vérifie que n8n est bien redémarré après l'installation du package
2. Consulte les logs n8n pour voir les erreurs détaillées
3. Teste d'abord avec le workflow manuel (pas de credential Solana requise)

---

**Version** : 1.0.0  
**Date** : 2025-10-07  
**Node** : n8n-nodes-photocertif v1.0.1
