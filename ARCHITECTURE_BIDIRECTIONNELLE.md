# 🏗️ Architecture Bidirectionnelle PhotoCertif B2B

## 🎯 Objectif

Créer un workflow n8n 100% automatisé où :
- ✅ L'utilisateur arrive avec **SOL uniquement**
- ✅ Le **serveur** fait le maximum de travail lourd
- ✅ Le **wallet reste côté n8n** (utilisateur)
- ✅ Communication bidirectionnelle entre n8n et serveur

---

## 📊 État Actuel (Mars 2025)

### ✅ **Ce qui Fonctionne**

| Étape | Lieu | Status | Description |
|-------|------|--------|-------------|
| 1. Get Pricing | Server API | ✅ | Récupère prix + infos payment |
| 2. Upload Document | Server API | ✅ | Stocke fichier + traitement |
| 3. Check CHECKHC Balance | n8n Code | ✅ | Vérifie solde utilisateur |
| 4. Swap SOL → CHECKHC | n8n + Jupiter | ✅ | Swap automatique si besoin |
| 5. Pay Certification | n8n Code | ✅ | Transfer CHECKHC au serveur |
| 6. Verify Payment | Server API | ✅ | Vérifie transaction on-chain |

**Résultat** : L'utilisateur peut payer avec SOL uniquement, tout est automatique jusqu'au paiement.

---

### ❌ **Ce qui Manque (Limitations Actuelles)**

#### **Problème 1: Upload Irys**

**État actuel** :
- ✅ Flux web (navigateur) : Irys upload côté client avec wallet connecté
- ❌ Flux n8n : Pas d'upload Irys server-side

**Raison** :
```typescript
// Dans /src/app/media/docs/certification/page.tsx (WEB)
await uploadBlobToIrys(originalBlob, ..., solanaWallet!)  // ✅ Fonctionne
await uploadJsonToIrysBrowser(metadata, ..., solanaWallet!)

// Dans /src/app/api/storage/docs/certify-with-payment/route.ts (API)
// TODO: Implement server-side NFT minting (ligne 204)  // ❌ Pas implémenté
```

**Blocage** :
- Irys nécessite signature avec clé privée
- Serveur n'a pas accès au wallet utilisateur
- Passer la clé privée au serveur = risque sécurité

#### **Problème 2: Mint NFT Server-Side**

**État actuel** :
- ✅ Flux web : Mint NFT côté client avec `@metaplex-foundation/umi`
- ❌ Flux API : Pas de mint server-side

**Raison** :
- Mint NFT nécessite signature avec clé privée utilisateur
- Serveur ne peut pas signer sans la clé

#### **Problème 3: Schéma Database**

Plusieurs champs nécessaires n'existent pas dans `iv_storage` :
```
❌ external_url
❌ medium_url
❌ wiki_url
❌ owner_wallet
❌ nft_address
❌ completed_at
```

**Impact** : Impossible de stocker certaines métadonnées sociales et informations NFT.

---

## 💡 **Solutions Disponibles**

### **Solution 1: Workflow Hybride (RECOMMANDÉ - Fonctionne maintenant)** ⭐

**Architecture** :
```
n8n (automatisé):
1. Get Pricing ✅
2. Upload Document ✅
3. Swap SOL → CHECKHC ✅
4. Pay Certification ✅
   └─> Retourne storage_id

Interface Web (manuel):
User ouvre: https://app2.photocertif.com/media/docs/certification?iv_storageid=XXX
Click: "Create NFT"
5. Upload Irys ✅
6. Mint NFT ✅
7. Transfer NFT ✅
```

**Avantages** :
- ✅ Fonctionne immédiatement sans modification serveur
- ✅ Sécurisé (wallet jamais transmis au serveur)
- ✅ Utilise le code existant et testé
- ✅ Support total des métadonnées

**Inconvénients** :
- ⚠️ Nécessite une intervention manuelle (1 click)
- ⚠️ L'utilisateur doit ouvrir le navigateur

**Workflow** : `workflow-docs-b2b-complete.json`

---

### **Solution 2: Bidirectionnel avec Clé Temporaire (Possible mais risqué)**

**Architecture** :
```
n8n → Server: "Prepare certification" (storage_id)
Server → n8n: "Need X SOL for Irys, here's metadata"

n8n: Swap + Pay + Fund Irys

n8n → Server: "Execute Irys upload" (storage_id + PRIVATE_KEY)
Server: 
  - Upload vers Irys avec clé utilisateur
  - CLEAR clé de la mémoire immédiatement
Server → n8n: "Irys complete, here's URLs + metadata"

n8n: Mint NFT avec metadata

n8n → Server: "Finalize" (storage_id + mint_address)
Server → n8n: "Certification complete ✅"
```

**Avantages** :
- ✅ 100% automatisé
- ✅ Maximise le travail serveur
- ✅ User fournit SOL uniquement

**Inconvénients** :
- ⚠️ **SÉCURITÉ** : Clé privée transmise au serveur (même temporairement)
- ⚠️ Nécessite modifications serveur importantes
- ⚠️ Nécessite ajout de champs à `iv_storage`
- ⚠️ Plus complexe à maintenir

**Status** : ❌ Non implémenté (pour raisons de sécurité)

**Note** : J'ai créé les endpoints mais supprimés car le schéma database manque des champs nécessaires.

---

### **Solution 3: Queue System avec Worker (Future)**

**Architecture** :
```
n8n → Server API: "Create certification job" (storage_id + paiement)
Server: Crée job en queue

Background Worker (Node.js + Bull):
1. Récupère job de la queue
2. Utilise WALLET SERVEUR (dédié, avec SOL/CHECKHC)
3. Upload vers Irys
4. Mint NFT
5. Transfer NFT au client
6. Update status: COMPLETED

n8n: Poll status jusqu'à COMPLETED
```

**Avantages** :
- ✅ 100% automatisé
- ✅ Sécurisé (pas de transmission de clés)
- ✅ Scalable (queue + workers)
- ✅ Retry automatique en cas d'erreur

**Inconvénients** :
- ⚠️ Nécessite infrastructure supplémentaire (Redis + Workers)
- ⚠️ Wallet serveur doit être pré-financé
- ⚠️ Coûts serveur additionnels

**Status** : 🚧 Planifié pour phase 2

---

## 🚀 **Workflow Actuel Recommandé**

**Fichier** : `workflow-docs-b2b-complete.json`

### **Étapes**

```
1. [n8n] Get Pricing
   └─> Prix, payment wallet, CHECKHC mint

2. [n8n] Upload Document (URL)
   └─> storage_id, hash, status

3. [n8n] Check CHECKHC Balance
   └─> Solde actuel

4. [n8n] IF (balance < prix):
      Swap SOL → CHECKHC via Jupiter
   └─> Nouveau solde

5. [n8n] Pay Certification
   └─> Transfer CHECKHC, signature

6. [Server] Verify Payment (automatique)
   └─> Payment validé

7. [USER] Open web UI avec storage_id
   └─> Click "Create NFT"

8. [Web/Browser] Irys Upload + NFT Mint
   └─> NFT créé ✅
```

### **Configuration n8n**

**Credentials requises** :
1. **PhotoCertif API**
   - URL: `https://localhost` ou `https://app2.photocertif.com`
   - API Key: `pk_live_xxxxx`

2. **Solana Wallet**
   - Private Key: Base58 format
   - Solde: SOL uniquement (pas besoin de CHECKHC !)
   - Minimum: ~1 SOL pour docs, ~3 SOL pour art

### **Résultat**

**Temps total** : ~45 secondes automation + 15 secondes manuel = 1 minute
**Intervention** : 1 click dans le navigateur
**User fournit** : SOL uniquement 🚀

---

## 📝 **Améliorations Futures**

### **Phase 1** (Court terme - 1-2 semaines)
- [ ] Ajouter champs manquants à `iv_storage` :
  ```sql
  ALTER TABLE iv_storage ADD COLUMN external_url TEXT;
  ALTER TABLE iv_storage ADD COLUMN medium_url TEXT;
  ALTER TABLE iv_storage ADD COLUMN wiki_url TEXT;
  ALTER TABLE iv_storage ADD COLUMN owner_wallet TEXT;
  ALTER TABLE iv_storage ADD COLUMN nft_address TEXT;
  ALTER TABLE iv_storage ADD COLUMN completed_at TIMESTAMP;
  ```

- [ ] Créer endpoint `/api/storage/docs/status/:storage_id`
  - Poll status depuis n8n
  - Retourne progression en temps réel

### **Phase 2** (Moyen terme - 1 mois)
- [ ] Implémenter queue system (Bull + Redis)
- [ ] Créer background workers pour:
  - Upload Irys
  - Mint NFT
  - Transfer NFT

- [ ] Wallet serveur dédié avec auto-refill

### **Phase 3** (Long terme - 3 mois)
- [ ] Dashboard de monitoring des jobs
- [ ] Webhooks pour notifier n8n
- [ ] Support multi-wallets utilisateurs
- [ ] Batch processing (plusieurs certifications en parallèle)

---

## 🔐 **Considérations Sécurité**

### **Approche Actuelle (Recommandée)**
✅ **Wallet jamais transmis au serveur**
✅ **Utilisateur garde contrôle total**
✅ **Transactions signées côté client**
✅ **Audit trail complet**

### **Approche Bidirectionnelle (Si implémentée)**
⚠️ **Clé privée transmise temporairement**
✅ **Cleared immédiatement de la mémoire**
✅ **HTTPS obligatoire**
✅ **API Key authentication**
❌ **Jamais loggée ou stockée**

### **Approche Queue System (Future)**
✅ **Wallet serveur isolé**
✅ **Permissions limitées**
✅ **Monitoring 24/7**
✅ **Auto-refill sécurisé**

---

## 📚 **Documentation Complémentaire**

- `B2B_WORKFLOW_LIMITATIONS.md` - Limitations détaillées
- `WORKFLOW_FIX_EXECUTION_ORDER.md` - Fix ordre d'exécution
- `SWAP_SOL_CHECKHC_GUIDE.md` - Guide swap SOL → CHECKHC
- `URL_SUPPORT_GUIDE.md` - Support upload URL
- `BATCH_CERTIFICATION_GUIDE.md` - Certification batch

---

## ✅ **Conclusion**

**Pour l'instant, utilise la Solution 1 (Workflow Hybride)** :
- ✅ Fonctionne immédiatement
- ✅ Sécurisé
- ✅ Testé et stable
- ⚠️ Nécessite 1 click manuel (acceptable pour B2B)

La **Solution 3 (Queue System)** sera implémentée plus tard pour automatisation 100% sans compromis sécurité.

---

**Dernière mise à jour** : 2025-01-08  
**Version** : 1.0  
**Status** : Documentation complète ✅
