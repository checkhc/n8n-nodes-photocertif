# 📊 Schéma Visuel - Flux Certification media/docs

## 🎬 Vue d'Ensemble du Flux

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUX COMPLET - media/docs                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   PHASE 1 : n8n     │  ⚡ AUTOMATIQUE
│   (5-10 secondes)   │
└─────────────────────┘
         │
         ├─► 1. Get Pricing (n8n → PhotoCertif API)
         │   └─► Récupère : 175.48 CHECKHC, wallet paiement
         │
         ├─► 2. Upload Document (n8n → PhotoCertif API)
         │   └─► Envoie : PDF base64, title, description
         │   └─► Reçoit : storage_id, hash
         │
         ├─► 3. Submit Certification (n8n → PhotoCertif API)
         │   └─► Envoie : storage_id, NFT metadata
         │   └─► Reçoit : certification_url ⭐
         │
         └─► 4. Check Status (n8n → PhotoCertif API)
             └─► Reçoit : status = "COMPLETED" (en attente paiement)

         ⬇️  TU RÉCUPÈRES : certification_url

┌─────────────────────┐
│   PHASE 2 : TOI     │  👤 MANUEL
│   (2-3 minutes)     │
└─────────────────────┘
         │
         ├─► 5. Ouvrir URL (Navigateur)
         │   └─► certification_url dans ton navigateur
         │
         ├─► 6. Connect Wallet (Page PhotoCertif)
         │   └─► Phantom, Solflare, etc.
         │   └─► Approuver connexion
         │
         └─► 7. Créer NFT (Page PhotoCertif)
             └─► Cocher "Accept terms"
             └─► Cliquer "Create NFT"
             └─► Approuver transaction dans wallet

         ⬇️  PAIEMENT EFFECTUÉ

┌─────────────────────┐
│ PHASE 3 : PhotoCertif│ 🔧 AUTOMATIQUE
│  (30-60 secondes)   │
└─────────────────────┘
         │
         ├─► 8. Vérifier Balance CHECKHC
         │   └─► Check : Ton wallet a assez de CHECKHC ?
         │
         ├─► 9. Transaction Paiement
         │   └─► 175.48 CHECKHC → Wallet PhotoCertif
         │   └─► Si referrer : Commission déduite
         │
         ├─► 10. Upload Métadonnées IPFS
         │   └─► Document info, NFT attributes
         │   └─► Pinata → CID récupéré
         │
         ├─► 11. Mint NFT Solana
         │   └─► Metaplex : Création NFT
         │   └─► Mint address généré
         │
         ├─► 12. Transfert NFT
         │   └─► NFT → Ton wallet
         │
         └─► 13. Update Database
             └─► Status : "certified"
             └─► NFT mint address sauvegardé

         ⬇️  ✅ CERTIFICATION TERMINÉE !

┌─────────────────────┐
│  RÉSULTAT FINAL     │  🎉 SUCCÈS
└─────────────────────┘
         │
         └─► Tu as :
             ✅ NFT dans ton wallet Solana
             ✅ Métadonnées sur IPFS
             ✅ Hash du document certifié
             ✅ Certificat téléchargeable PDF
             ✅ Lien Solscan pour vérification
```

---

## 🔄 Interactions Détaillées

### **1️⃣ Get Pricing - n8n → PhotoCertif**

```
┌─────────┐                              ┌──────────────┐
│   n8n   │  GET /api/pricing/service   │  PhotoCertif │
│         │ ───────────────────────────► │     API      │
│         │                              │              │
│         │  { price_checkhc: 175.48 }  │              │
│         │ ◄─────────────────────────── │              │
└─────────┘                              └──────────────┘

DONNÉES TRANSMISES :
Query Params : ?type=docs
Headers : Authorization: Bearer pk_live_xxx

DONNÉES REÇUES :
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

---

### **2️⃣ Upload Document - n8n → PhotoCertif**

```
┌─────────┐                                    ┌──────────────┐
│   n8n   │  POST /api/storage/docs/upload    │  PhotoCertif │
│         │ ─────────────────────────────────► │     API      │
│         │  { file: base64, title, desc }    │              │
│         │                                    │      │       │
│         │                                    │  Save File   │
│         │                                    │  Calculate   │
│         │                                    │  Hash        │
│         │                                    │      │       │
│         │  { storage_id, hash, status }     │      ▼       │
│         │ ◄───────────────────────────────── │  Database    │
└─────────┘                                    └──────────────┘

DONNÉES TRANSMISES :
Headers : Authorization: Bearer pk_live_xxx
Body : 
{
  "file": "data:application/pdf;base64,JVBERi0...",
  "title": "Contract ABC-2025",
  "description": "Official contract..."
}

DONNÉES REÇUES :
{
  "storage_id": "iv_1728316892508_wp776fb",
  "status": "uploaded",
  "hash": "abc123def456...",
  "message": "File uploaded successfully",
  "user_id": "user_xxx"
}

FICHIER SAUVEGARDÉ :
/var/www/photocertif/storage/{user_id}/iv_1728316892508_wp776fb/document.pdf
```

---

### **3️⃣ Submit Certification - n8n → PhotoCertif**

```
┌─────────┐                                    ┌──────────────┐
│   n8n   │  POST /api/storage/docs/certify   │  PhotoCertif │
│         │ ─────────────────────────────────► │     API      │
│         │  { id, name, symbol, desc }       │              │
│         │                                    │      │       │
│         │                                    │  Save NFT    │
│         │                                    │  Metadata    │
│         │                                    │      │       │
│         │  { certification_url }            │      ▼       │
│         │ ◄───────────────────────────────── │  Database    │
└─────────┘                                    └──────────────┘

DONNÉES TRANSMISES :
Headers : Authorization: Bearer pk_live_xxx
Body :
{
  "id": "iv_1728316892508_wp776fb",
  "name": "ContractABC2025",
  "cert_symbol": "CABC",
  "cert_description": "Official certification...",
  "cert_prop": "Company ABC Inc",
  "cert_C2PA": false
}

DONNÉES REÇUES :
{
  "success": true,
  "message": "Certification form submitted",
  "storage_id": "iv_1728316892508_wp776fb",
  "notice": "User must complete payment and NFT minting...",
  "certification_url": "https://localhost/media/docs/certification?iv_storageid=iv_xxx"
}

DATABASE UPDATE :
Storage.update({
  id: "iv_1728316892508_wp776fb",
  status: "COMPLETED",
  nft_name: "ContractABC2025",
  nft_symbol: "CABC",
  ...
})
```

---

### **4️⃣ Check Status - n8n → PhotoCertif**

```
┌─────────┐                              ┌──────────────┐
│   n8n   │  GET /api/storage/docs/status│  PhotoCertif │
│         │ ───────────────────────────► │     API      │
│         │  ?id=iv_xxx                  │              │
│         │                              │      │       │
│         │                              │  Query DB    │
│         │                              │      │       │
│         │  { status, storage_id, ... } │      ▼       │
│         │ ◄─────────────────────────── │  Database    │
└─────────┘                              └──────────────┘

DONNÉES TRANSMISES :
Query Params : ?id=iv_1728316892508_wp776fb
Headers : Authorization: Bearer pk_live_xxx

DONNÉES REÇUES (avant paiement) :
{
  "status": "COMPLETED",
  "storage_id": "iv_1728316892508_wp776fb",
  "title": "Contract ABC-2025",
  "hash": "abc123def456...",
  "file_type": "application/pdf",
  "created_at": "2025-10-07T15:00:00.000Z"
}

DONNÉES REÇUES (après paiement) :
{
  "status": "certified",
  "storage_id": "iv_1728316892508_wp776fb",
  "nft_mint": "FxYz...Ab12",
  "transaction_signature": "abc123...",
  "certified_at": "2025-10-07T15:30:00.000Z"
}
```

---

### **5️⃣-7️⃣ Paiement & NFT - TOI → PhotoCertif**

```
┌──────────────┐                            ┌──────────────┐
│  Navigateur  │  1. Ouvre URL certification│  PhotoCertif │
│    (TOI)     │ ─────────────────────────► │   Frontend   │
│              │                            │              │
│              │  2. Page de certification  │              │
│              │ ◄───────────────────────── │              │
│              │                            │              │
│   Wallet     │  3. Connect Wallet (click) │              │
│   Phantom    │ ─────────────────────────► │              │
│              │                            │      │       │
│              │  4. Wallet popup approval  │  Check       │
│              │ ◄───────────────────────── │  Balance     │
│              │                            │      │       │
│              │  5. Create NFT (click)     │      ▼       │
│              │ ─────────────────────────► │  Generate    │
│              │                            │  Transaction │
│              │                            │      │       │
│              │  6. Sign Transaction       │      ▼       │
│              │ ◄───────────────────────── │              │
│              │                            │              │
│              │  7. Transaction signed     │              │
│              │ ─────────────────────────► │              │
│              │                            └──────┬───────┘
│              │                                   │
│              │                            ┌──────▼───────┐
│              │                            │   Solana     │
│              │                            │  Blockchain  │
│              │                            │      │       │
│              │                            │  1. Payment  │
│              │                            │     TX       │
│              │                            │  2. Mint NFT │
│              │                            │  3. Transfer │
│              │                            │      │       │
│              │  8. Success + NFT address  │      ▼       │
│              │ ◄─────────────────────────────── OK       │
└──────────────┘                            └──────────────┘

FLUX DÉTAILLÉ :

1. TOI cliques sur l'URL
   └─► Page PhotoCertif se charge avec toutes les infos

2. Page affiche :
   ├─► Document info (titre, hash, date)
   ├─► NFT metadata (name, symbol, description)
   ├─► Prix en CHECKHC
   └─► Bouton "Connect Wallet"

3. TOI cliques "Connect Wallet"
   └─► Popup wallet s'ouvre (Phantom, Solflare, etc.)
   └─► TOI approuves la connexion
   └─► Wallet connecté ✅

4. Page vérifie automatiquement :
   ├─► Balance CHECKHC suffisante ?
   ├─► Wallet compatible ?
   └─► Active le bouton "Create NFT" si OK

5. TOI coches "Accept terms" et cliques "Create NFT"
   └─► PhotoCertif génère la transaction Solana
   └─► Transaction envoyée à ton wallet

6. Popup wallet pour signature
   └─► TOI vois : "Approve transaction to create NFT"
   └─► Amount : 175.48 CHECKHC
   └─► To : C6bK...hESFg (PhotoCertif wallet)
   └─► TOI approuves

7. Transaction signée et envoyée à Solana
   └─► Confirmation en quelques secondes
   └─► PhotoCertif détecte le paiement

8. PhotoCertif crée automatiquement le NFT
   ├─► Upload métadonnées IPFS
   ├─► Mint NFT sur Solana
   ├─► Transfert NFT à ton wallet
   └─► Update database status = "certified"

9. Page affiche succès
   └─► NFT address, transaction links
   └─► Boutons : Download PDF, View on Solscan, Share
```

---

## 📊 Répartition du Travail

```
┌────────────────────────────────────────────────────────────────┐
│                    QUI FAIT QUOI ?                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │         n8n (Automatique - 5-10 sec)                │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  ✅ Appels API PhotoCertif                          │     │
│  │  ✅ Récupération du pricing                        │     │
│  │  ✅ Upload du document                              │     │
│  │  ✅ Soumission du formulaire                        │     │
│  │  ✅ Vérification du statut                          │     │
│  │  ✅ Formatage des données                           │     │
│  │  ✅ Gestion de l'authentification (API Key)        │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │         TOI (Manuel - 2-3 min)                      │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  📝 Encoder le PDF en base64                        │     │
│  │  ⚙️ Configurer le workflow n8n                      │     │
│  │  ▶️ Lancer le workflow                              │     │
│  │  🔗 Ouvrir l'URL de certification                   │     │
│  │  🔌 Connecter le wallet Solana                      │     │
│  │  ✍️ Approuver la transaction                        │     │
│  │  ☑️ Cocher "Accept terms"                           │     │
│  │  🚀 Cliquer "Create NFT"                            │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                                │
│  ┌─────────────────────────────────────────────────────┐     │
│  │   PhotoCertif Backend (Automatique - 30-60 sec)     │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  💾 Sauvegarde du fichier                           │     │
│  │  🔐 Calcul du hash                                  │     │
│  │  💳 Vérification du paiement                        │     │
│  │  📤 Upload métadonnées IPFS                         │     │
│  │  🎨 Création du NFT Solana                          │     │
│  │  📮 Transfert du NFT au wallet                      │     │
│  │  💾 Mise à jour de la base de données              │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline Typique

```
T+0:00  ▶️  TOI : Lance le workflow n8n
         │
         ├── n8n : Get Pricing (0.5s)
         ├── n8n : Upload Document (1s)
         ├── n8n : Submit Certification (0.5s)
         └── n8n : Check Status (0.5s)
         │
T+0:05  ✅  n8n : Workflow terminé, URL récupérée

--- PAUSE : TOI copies l'URL ---

T+0:30  🔗  TOI : Ouvre l'URL dans le navigateur
         │
T+0:35  📄  Page PhotoCertif : Chargée
         │
T+0:40  🔌  TOI : Clique "Connect Wallet"
         │
T+0:45  ✅  Wallet : Connecté
         │
T+1:00  🚀  TOI : Clique "Create NFT"
         │
T+1:05  ✍️  TOI : Approuve la transaction dans Phantom
         │
         ├── Solana : Transaction paiement (5-10s)
         │
T+1:15  ✅  Paiement : Confirmé
         │
         ├── PhotoCertif : Upload IPFS (10s)
         ├── PhotoCertif : Mint NFT (20s)
         └── PhotoCertif : Transfer NFT (10s)
         │
T+1:55  🎉  SUCCESS : NFT créé et transféré !

───────────────────────────────────────────
TOTAL : ~2 minutes (dont 1min30 manuel)
```

---

## 🎯 Points Clés à Retenir

### **✅ n8n est parfait pour** :
- Automatiser les appels API répétitifs
- Gérer l'authentification
- Formater et transformer les données
- Déclencher des workflows sur événements
- Orchestrer plusieurs services

### **❌ n8n NE PEUT PAS** :
- Signer des transactions blockchain
- Accéder à ta clé privée de wallet
- Payer automatiquement en crypto
- Créer des NFT sans paiement humain

### **🔐 Pourquoi cette limitation ?** :
```
C'est une PROTECTION DE SÉCURITÉ !

Si n8n pouvait :
❌ Accéder à ta clé privée
❌ Signer des transactions automatiquement
❌ Payer sans ton approbation

Alors :
⚠️ Un bug dans le workflow = perte de fonds
⚠️ Un hack de n8n = vol de tes cryptos
⚠️ Une erreur de config = transactions non voulues

Donc :
✅ Les wallets restent TOUJOURS sous contrôle humain
✅ Chaque transaction nécessite ton approbation
✅ Ta clé privée ne quitte JAMAIS ton wallet
```

---

## 📞 Documentation Complète

**Fichiers** :
- `GUIDE_UTILISATION_DOCS.md` - Guide détaillé (ce fichier)
- `SCHEMA_FLUX_DOCS.md` - Schémas visuels
- `workflow-docs-certification.json` - Workflow à importer
- `WORKFLOWS_README.md` - Quick start

**Support** :
- N8N_INTEGRATION_GUIDE.md - Documentation technique
- AUTOMATED_PAYMENT_APIS.md - Documentation API PhotoCertif

---

**Prêt à certifier ! 🚀**
