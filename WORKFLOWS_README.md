# 🚀 PhotoCertif n8n Workflows - Ready to Import

## ✅ Statut Actuel

**Package installé** : n8n-nodes-photocertif v1.0.1 ✅  
**Emplacement** : `/home/greg/.n8n/nodes/node_modules/n8n-nodes-photocertif`  
**Opération getPricing** : ✅ Disponible  
**Date de mise à jour** : 2025-10-07 17:04

---

## 📦 Workflows Prêts à l'Import

### **1. workflow-docs-certification.json** 📄
**Certification de Documents (media/docs)**

**Contenu du workflow** :
```
Manual Trigger → Test Data → [Get Pricing + Upload Document] 
                             → Submit Certification → Check Status → Results Summary
```

**Fonctionnalités** :
- ✅ Récupération du prix CHECKHC en temps réel
- ✅ Upload de documents (PDF, DOCX, TXT, ZIP)
- ✅ Soumission de certification avec métadonnées NFT
- ✅ Vérification du statut
- ✅ Résumé visuel des résultats

**Cas d'usage** :
- Contrats et documents légaux
- Archives numériques
- Documents officiels
- Certificats et diplômes

---

### **2. workflow-image2-certification.json** 🎨
**Certification d'Art (media/image2)**

**Contenu du workflow** :
```
Manual Trigger → Test Data → [Get Pricing + Upload Image] 
                             → Submit Certification → Check Status → Results Summary
```

**Fonctionnalités** :
- ✅ Récupération du prix CHECKHC en temps réel
- ✅ Upload d'images (JPG, PNG, GIF, WEBP)
- ✅ Analyse IA avec 4 niveaux d'authenticité
- ✅ Stockage permanent sur Arweave
- ✅ Vérification PRNU de l'empreinte caméra
- ✅ Watermark de certification
- ✅ Résumé visuel étendu

**Cas d'usage** :
- Œuvres d'art digitales
- Photographies professionnelles
- NFT Art collections
- Certification d'authenticité

---

## 🚀 Import Rapide (3 étapes)

### **Étape 1 : Redémarrer n8n**
```bash
sudo systemctl restart n8n
```

### **Étape 2 : Créer les Credentials**
1. Ouvrir n8n : `http://localhost:5678`
2. Settings → Credentials → New Credential
3. Chercher "PhotoCertif API"
4. Remplir :
   - **URL** : `https://localhost` (dev) ou `https://app2.photocertif.com` (prod)
   - **API Key** : `pk_live_xxxxxxxxxxxxx`
5. Save

### **Étape 3 : Importer le Workflow**
1. Workflows → Import from File
2. Sélectionner `workflow-docs-certification.json` ou `workflow-image2-certification.json`
3. Modifier le node "Test Data (Modify Here)" avec vos données
4. Assigner les credentials aux nodes PhotoCertif
5. Cliquer "Test workflow"

---

## 📝 Structure des Données de Test

### **Pour media/docs :**
```json
{
  "fileBase64": "data:application/pdf;base64,JVBERi0x...",
  "title": "Contract 2025",
  "description": "Official contract",
  "cert_name": "Contract2025",
  "cert_symbol": "CNTR",
  "cert_description": "Contract certification",
  "cert_owner": "Company ABC Inc"
}
```

### **Pour media/image2 :**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZ...",
  "title": "Digital Art 2025",
  "description": "Original digital artwork",
  "cert_name": "DigitalArt2025",
  "cert_symbol": "ART",
  "cert_description": "Certified artwork",
  "cert_owner": "Artist Studio",
  "external_url": "https://example.com/gallery"
}
```

---

## 🎯 Résultats Attendus

### **Node "1. Get Pricing"**
```json
{
  "success": true,
  "type": "docs",
  "price_checkhc": 175.48,
  "price_usd": 1,
  "checkhc_mint": "5tpkrCVVh6tjjve4TuyP8MXBwURufgAnaboaLwo49uau",
  "payment_wallet": "C6bKUrdk13g7ihmeZunRcCysT7FYwHX42DXu6Y6hESFg",
  "network": "mainnet-beta"
}
```

### **Node "2. Upload"**
```json
{
  "storage_id": "iv_1728316892508_ab123cd",
  "status": "uploaded",
  "hash": "abc123def456...",
  "message": "File uploaded successfully"
}
```

### **Node "3. Submit Certification"**
```json
{
  "success": true,
  "notice": "Certification form submitted. User must complete payment...",
  "certification_url": "https://localhost/media/docs/certification?iv_storageid=iv_xxx"
}
```

### **Node "4. Check Status"**
```json
{
  "status": "pending_payment",
  "storage_id": "iv_xxx",
  "message": "Waiting for user payment"
}
```

---

## 📊 Comparaison des Offres

| Feature | media/docs | media/image2 |
|---------|-----------|--------------|
| **Type** | Documents | Images Art |
| **Stockage** | IPFS temporaire | Arweave permanent |
| **Analyse IA** | ❌ | ✅ 4 niveaux |
| **PRNU** | ❌ | ✅ Camera fingerprint |
| **Watermark** | ❌ | ✅ Certification mark |
| **Prix USD** | ~1 USD | ~3 USD |
| **Prix CHECKHC** | ~175 CHECKHC | ~525 CHECKHC |

---

## 🔧 Encodage Base64

### **PDF**
```bash
base64 -w 0 document.pdf > doc.txt
# Ajouter le préfixe: data:application/pdf;base64,
```

### **Image JPEG**
```bash
base64 -w 0 image.jpg > img.txt
# Ajouter le préfixe: data:image/jpeg;base64,
```

### **Image PNG**
```bash
base64 -w 0 image.png > img.txt
# Ajouter le préfixe: data:image/png;base64,
```

---

## 🔄 Flux de Certification Complet

### **Phase 1 : Automatisée (n8n)**
1. ✅ Get Pricing → Récupère le prix actuel
2. ✅ Upload → Upload le fichier
3. ✅ Submit Certification → Soumet la demande

### **Phase 2 : Manuel (Utilisateur)**
4. ⚠️ Utilisateur ouvre l'URL de certification
5. ⚠️ Utilisateur connecte son wallet Solana
6. ⚠️ Utilisateur paie en CHECKHC
7. ⚠️ Système crée le NFT automatiquement

### **Phase 3 : Vérification (n8n - optionnel)**
8. ✅ Check Status → Vérifie la complétion
9. OU Wait for Certification → Polling automatique

---

## 🛠️ Troubleshooting Rapide

### **Node PhotoCertif introuvable**
```bash
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz
sudo systemctl restart n8n
```

### **Credentials invalides**
- Vérifier l'API Key dans PhotoCertif → My Account → API Keys
- Format : `pk_live_xxxxxxxxxxxxx`
- Vérifier l'URL : `https://localhost` (dev) ou `https://app2.photocertif.com` (prod)

### **Erreur Upload**
- Vérifier le format base64 avec préfixe `data:...;base64,`
- Vérifier la taille du fichier (max ~10MB recommandé)
- Vérifier le type MIME correspond au fichier

---

## 📂 Fichiers du Projet

```
/home/greg/n8n-nodes-photocertif/
├── workflow-docs-certification.json          ← Import ce fichier pour docs
├── workflow-image2-certification.json        ← Import ce fichier pour images
├── WORKFLOWS_IMPORT_GUIDE.md                 ← Guide complet
├── WORKFLOWS_README.md                       ← Ce fichier (quick start)
├── N8N_INTEGRATION_GUIDE.md                  ← Documentation technique
├── MODIFICATION_SUCCESS.md                   ← Changelog getPricing
├── n8n-nodes-photocertif-1.0.1.tgz          ← Package installé
└── nodes/PhotoCertif/PhotoCertif.node.ts     ← Source code
```

---

## 📞 Documentation Complète

**Guide détaillé** : `WORKFLOWS_IMPORT_GUIDE.md`  
**Intégration n8n** : `N8N_INTEGRATION_GUIDE.md`  
**APIs PhotoCertif** : `/home/greg/photocertif/AUTOMATED_PAYMENT_APIS.md`

---

## ✅ Checklist Avant de Commencer

- [ ] Package n8n-nodes-photocertif v1.0.1 installé
- [ ] n8n redémarré (`sudo systemctl restart n8n`)
- [ ] Credentials PhotoCertif API créées dans n8n
- [ ] API Key PhotoCertif récupérée
- [ ] Fichier à certifier encodé en base64
- [ ] Workflow importé dans n8n
- [ ] Test Data modifiées avec vos données
- [ ] Prêt à tester ! 🚀

---

## 🎉 Prêt à Certifier !

**Pour commencer** :
1. Importer un workflow
2. Modifier les Test Data
3. Cliquer "Test workflow"
4. Observer les résultats
5. Ouvrir l'URL de certification pour compléter le paiement

**Questions ?** Consulter `WORKFLOWS_IMPORT_GUIDE.md` pour plus de détails.

---

**Version** : 1.0.1  
**Date** : 2025-10-07  
**Node** : n8n-nodes-photocertif avec opération getPricing ✅
