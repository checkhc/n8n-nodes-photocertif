# 📥 Guide d'Import des Workflows n8n

## ✅ Statut du Package

**Package installé** : ✅ n8n-nodes-photocertif v1.0.1 (avec getPricing)  
**Installation** : `/home/greg/.n8n/nodes/node_modules/n8n-nodes-photocertif`  
**Dernière mise à jour** : 2025-10-07 17:04

---

## 📦 Workflows Disponibles

### **1. workflow-docs-certification.json**
**Type** : Document Certification (media/docs)  
**Fonctionnalités** :
- ✅ Get Pricing - Récupère le prix CHECKHC en temps réel
- ✅ Upload Document - Upload PDF, DOCX, TXT, ZIP, etc.
- ✅ Submit Certification - Soumet la demande de certification
- ✅ Check Status - Vérifie le statut de la certification

**Cas d'usage** : 
- Contrats légaux
- Documents officiels
- Archives numériques
- Certification de documents

---

### **2. workflow-image2-certification.json**
**Type** : Art Certification (media/image2)  
**Fonctionnalités** :
- ✅ Get Pricing - Récupère le prix CHECKHC en temps réel
- ✅ Upload Image - Upload JPG, PNG, GIF, etc.
- ✅ Submit Certification - Soumet la demande avec analyse IA
- ✅ Check Status - Vérifie le statut avec métadonnées étendues

**Cas d'usage** :
- Œuvres d'art digitales
- Photographies professionnelles
- NFT Art
- Collections d'art
- Stockage permanent Arweave

**Spécificités media/image2** :
- 🎨 Analyse IA avec 4 niveaux d'authenticité
- 🔒 Stockage permanent sur Arweave (pas IPFS temporaire)
- 📸 Vérification PRNU de l'empreinte caméra
- 🖼️ Watermark de certification ajouté

---

## 📥 Import dans n8n

### **Étape 1 : Redémarrer n8n**

```bash
sudo systemctl restart n8n
```

**Attendre** : 10-15 secondes pour que n8n redémarre complètement

---

### **Étape 2 : Vérifier que le node PhotoCertif est disponible**

1. Ouvrir n8n : `http://localhost:5678`
2. Créer un nouveau workflow
3. Cliquer sur "Add node" (+)
4. Chercher "PhotoCertif"
5. ✅ Le node doit apparaître avec l'icône PhotoCertif

---

### **Étape 3 : Configurer les Credentials**

**Avant d'importer les workflows**, configurer les credentials :

1. Dans n8n, aller à **Settings** → **Credentials**
2. Cliquer sur **"New Credential"**
3. Chercher **"PhotoCertif API"**
4. Remplir les informations :

   **Pour DEV (localhost)** :
   ```
   PhotoCertif URL: https://localhost
   API Key: pk_live_xxxxxxxxxxxxx
   ```

   **Pour PRODUCTION** :
   ```
   PhotoCertif URL: https://app2.photocertif.com
   API Key: pk_live_xxxxxxxxxxxxx
   ```

5. Cliquer sur **"Save"**

**Note** : L'API Key se trouve dans PhotoCertif → My Account → API Keys

---

### **Étape 4 : Importer le Workflow**

#### **Option A : Via l'Interface n8n**

1. Ouvrir n8n : `http://localhost:5678`
2. Cliquer sur **"Workflows"** dans le menu
3. Cliquer sur **"Import from File"** ou **"Import from URL"**
4. Sélectionner le fichier :
   - `workflow-docs-certification.json` pour les documents
   - `workflow-image2-certification.json` pour les images
5. Le workflow s'ouvre automatiquement
6. ✅ Vérifier que tous les nodes sont bien connectés

#### **Option B : Via Copier-Coller**

1. Ouvrir le fichier JSON dans un éditeur
2. Copier **tout** le contenu
3. Dans n8n, créer un nouveau workflow
4. Cliquer sur les **3 points** (menu) → **"Import from Clipboard"**
5. Coller le JSON
6. Cliquer sur **"Import"**

---

### **Étape 5 : Configurer le Workflow**

#### **Pour workflow-docs-certification.json :**

1. Ouvrir le node **"Test Data (Modify Here)"**
2. Modifier les valeurs :
   ```
   fileBase64: Votre PDF encodé en base64
   title: "Nom de votre document"
   description: "Description de votre document"
   cert_name: "NomCertification" (alphanumeric uniquement)
   cert_symbol: "SYMB" (4 lettres majuscules max)
   cert_description: "Description de la certification"
   cert_owner: "Nom du propriétaire" (20 caractères max)
   ```

#### **Pour workflow-image2-certification.json :**

1. Ouvrir le node **"Test Data (Modify Here)"**
2. Modifier les valeurs :
   ```
   imageBase64: Votre image encodée en base64
   title: "Nom de votre image"
   description: "Description de votre image"
   cert_name: "NomCertification"
   cert_symbol: "ART"
   cert_description: "Description de la certification"
   cert_owner: "Nom de l'artiste"
   external_url: "https://votre-site.com" (optionnel)
   ```

---

### **Étape 6 : Tester le Workflow**

1. Vérifier que les credentials sont bien assignées à chaque node PhotoCertif
2. Cliquer sur **"Test workflow"** en haut à droite
3. Observer les résultats dans chaque node
4. Le node **"Results Summary"** affiche un résumé complet

**Résultats attendus** :
- ✅ **1. Get Pricing** : Prix CHECKHC actuel, wallet de paiement
- ✅ **2. Upload** : storage_id, hash, status
- ✅ **3. Submit Certification** : URL de certification, notice
- ✅ **4. Check Status** : Statut actuel du certificat

---

## 🔧 Encodage Base64 de Fichiers

### **Pour encoder un fichier PDF en base64** :

```bash
base64 -w 0 document.pdf > document_base64.txt
```

### **Pour encoder une image en base64** :

```bash
base64 -w 0 image.jpg > image_base64.txt
```

### **Ajouter le préfixe data URI** :

**Pour PDF** :
```
data:application/pdf;base64,<contenu_base64>
```

**Pour JPEG** :
```
data:image/jpeg;base64,<contenu_base64>
```

**Pour PNG** :
```
data:image/png;base64,<contenu_base64>
```

---

## 🔄 Flux Complet de Certification

### **Phase 1 : Préparation (n8n)**
1. Get Pricing → Récupère le prix CHECKHC
2. Upload → Upload le fichier, obtient storage_id
3. Submit Certification → Soumet le formulaire de certification

### **Phase 2 : Paiement (Utilisateur)**
4. **L'utilisateur reçoit une URL de certification**
5. **L'utilisateur ouvre l'URL dans son navigateur**
6. **L'utilisateur connecte son wallet Solana**
7. **L'utilisateur paie en CHECKHC**
8. **Le système crée automatiquement le NFT**

### **Phase 3 : Vérification (n8n - optionnel)**
9. Check Status → Vérifie si la certification est complétée
10. OU utiliser "Wait for Certification" pour polling automatique

---

## 📊 Différences media/docs vs media/image2

| Feature | media/docs | media/image2 |
|---------|-----------|--------------|
| **Type de fichier** | PDF, DOCX, TXT, ZIP | JPG, PNG, GIF, WEBP |
| **Analyse IA** | ❌ Non | ✅ Oui (4 niveaux) |
| **Stockage** | IPFS temporaire | Arweave permanent |
| **PRNU** | ❌ Non | ✅ Oui |
| **Watermark** | ❌ Non | ✅ Oui |
| **Prix typique** | ~1 USD | ~3 USD |
| **Use case** | Documents, contrats | Art, photographie |

---

## 🛠️ Troubleshooting

### **Erreur : "Node PhotoCertif not found"**

**Solution** :
```bash
cd /home/greg/.n8n/nodes
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz
sudo systemctl restart n8n
```

---

### **Erreur : "Credentials not set"**

**Solution** :
1. Cliquer sur chaque node PhotoCertif
2. Dans "Credentials", sélectionner "PhotoCertif API"
3. Si non disponible, créer les credentials (voir Étape 3)

---

### **Erreur : "Invalid API Key"**

**Solution** :
1. Vérifier l'API Key dans PhotoCertif → My Account → API Keys
2. L'API Key doit commencer par `pk_live_` ou `pk_test_`
3. Vérifier que l'API Key a les scopes nécessaires

---

### **Erreur : "URL not accessible"**

**Pour DEV (localhost)** :
- Vérifier que PhotoCertif dev tourne : `./scripts/manage-dev.sh status`
- Vérifier nginx : `sudo systemctl status nginx`
- URL correcte : `https://localhost` (pas `http://localhost:3000`)

**Pour PROD** :
- URL correcte : `https://app2.photocertif.com`

---

## 🎯 Utilisation Avancée

### **Workflow avec Wait for Certification**

Pour automatiser l'attente de la certification complète :

1. Ajouter un node **PhotoCertif** après "Submit Certification"
2. Choisir l'opération **"Wait for Certification"**
3. Configurer :
   - Polling Interval: 300 secondes (5 minutes)
   - Max Wait Time: 86400 secondes (24 heures)
4. Le workflow attend que l'utilisateur complète le paiement

**Attention** : Ce node bloque l'exécution pendant l'attente !

---

### **Workflow avec Webhook Trigger**

Pour déclencher automatiquement depuis une autre application :

1. Remplacer "Manual Trigger" par "Webhook"
2. Configurer le webhook URL
3. Envoyer les données via POST :
   ```json
   {
     "fileBase64": "data:application/pdf;base64,...",
     "title": "Document Title",
     "cert_name": "DocName",
     ...
   }
   ```

---

## 📞 Support

**Documentation complète** : `/home/greg/n8n-nodes-photocertif/N8N_INTEGRATION_GUIDE.md`

**APIs PhotoCertif** :
- DEV : `https://localhost/api/...`
- PROD : `https://app2.photocertif.com/api/...`

**Endpoints disponibles** :
- `GET /api/pricing/service?type=docs` - Get pricing
- `POST /api/storage/{type}/upload/iv_route` - Upload
- `POST /api/storage/{type}/certify/iv_route` - Submit certification
- `GET /api/storage/{type}/status/iv_route?id=xxx` - Check status

---

## ✅ Checklist Import

- [ ] Package n8n-nodes-photocertif installé et à jour
- [ ] n8n redémarré
- [ ] Node PhotoCertif visible dans n8n
- [ ] Credentials PhotoCertif API créées
- [ ] Workflow importé (docs ou image2)
- [ ] Test Data modifiées avec vos données
- [ ] Credentials assignées à tous les nodes
- [ ] Test workflow exécuté avec succès
- [ ] Résultats vérifiés dans Results Summary

---

**Prêt à certifier ! 🚀**
