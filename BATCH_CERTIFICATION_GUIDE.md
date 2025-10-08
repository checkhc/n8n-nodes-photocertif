# 📊 Guide de Certification par Lot (Batch)

## 📥 Fichier d'Exemple Fourni

**Fichier** : `photocertif-batch-example.csv`

Ce fichier contient **3 exemples complets** avec toutes les colonnes nécessaires pour la certification automatisée.

---

## 📋 Colonnes Requises

### **Champs Obligatoires** (Upload)

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `fileUrl` | URL publique du fichier (Google Drive, Dropbox, CDN) | `https://drive.google.com/uc?id=...&export=download` |
| `title` | Titre de la certification | `My Artwork 2025` |
| `description` | Description du contenu | `Digital art certified on blockchain` |

### **Champs Obligatoires** (NFT Metadata)

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `cert_name` | Nom du certificat NFT | `MyArt2025` |
| `cert_symbol` | Symbole du certificat (court) | `MYART` |
| `cert_description` | Description complète du certificat | `Original digital artwork...` |
| `cert_owner` | Propriétaire/Créateur | `John Doe Artist` |

### **Champs Optionnels** (Social Links)

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `external_url` | Site web principal | `https://myportfolio.com` |
| `twitter_url` | Profile Twitter/X | `https://x.com/username` |
| `discord_url` | Serveur Discord | `https://discord.gg/invite` |
| `instagram_url` | Profile Instagram | `https://instagram.com/username` |
| `telegram_url` | Channel Telegram | `https://t.me/channel` |
| `medium_url` | Blog Medium | `https://medium.com/@username` |
| `wiki_url` | Documentation/Wiki | `https://docs.project.com` |
| `youtube_url` | Chaîne YouTube | `https://youtube.com/@channel` |

---

## 🚀 Utilisation avec n8n

### **1. Ouvrir le fichier CSV dans Google Sheets**

```
1. Aller sur https://sheets.google.com
2. Fichier → Importer → Uploader photocertif-batch-example.csv
3. Modifier les données selon vos besoins
4. Partager → Obtenir le lien (Anyone with the link can view)
```

### **2. Configurer le Workflow n8n**

**Remplacer le node "Input Data" par "Google Sheets"** :

```
1. Dans n8n, supprimer le node "Input Data"
2. Ajouter node "Google Sheets" → Read
3. Authentifier avec votre compte Google
4. Sélectionner votre spreadsheet
5. Sélectionner la feuille "Sheet1"
6. Connecter à "1. Get Pricing"
```

**Ou utiliser "Spreadsheet File"** (fichier local) :

```
1. Supprimer le node "Input Data"
2. Ajouter node "Spreadsheet File" → Read from File
3. File Input Mode: Binary Data
4. Ajouter node "Read Binary File" avant
5. Spécifier le chemin: /path/to/photocertif-batch-example.csv
```

### **3. Mapper les Colonnes**

Les colonnes du CSV correspondent exactement aux champs du workflow :

```javascript
// Automatique si noms identiques
{
  fileUrl: "={{ $json.fileUrl }}",
  title: "={{ $json.title }}",
  description: "={{ $json.description }}",
  cert_name: "={{ $json.cert_name }}",
  // ... etc
}
```

---

## 🎯 Exemples de Cas d'Usage

### **Exemple 1 : Galerie d'Art (Toutes les colonnes remplies)**

```csv
fileUrl,title,cert_name,cert_symbol,external_url,twitter_url,instagram_url
https://drive.google.com/...,Artwork #1,Art2025,ART,https://gallery.com,https://x.com/artist,https://instagram.com/artist
```

**Résultat** : NFT avec métadonnées complètes + tous les social links

### **Exemple 2 : Documents Légaux (Minimum requis)**

```csv
fileUrl,title,cert_name,cert_symbol,cert_description,cert_owner
https://dropbox.com/...,Contract Q1,LegalDoc,LEGAL,Official contract,Acme Corp
```

**Résultat** : NFT basique sans social links (champs optionnels vides)

### **Exemple 3 : Photographie (Mix colonnes)**

```csv
fileUrl,title,cert_name,cert_symbol,external_url,instagram_url
https://cdn.com/photo.jpg,Sunset,Photo2025,PHOTO,https://portfolio.com,https://instagram.com/photo
```

**Résultat** : NFT avec website + Instagram, autres social links vides

---

## 📝 Bonnes Pratiques

### **URLs de Fichiers**

✅ **Recommandé** :
- Google Drive : `https://drive.google.com/uc?id=FILE_ID&export=download`
- Dropbox : `https://www.dropbox.com/s/abc123/file.jpg?dl=1` (notez `?dl=1`)
- URL directe : `https://cdn.example.com/image.jpg`

❌ **À éviter** :
- URLs avec authentification requise
- URLs temporaires (expiration)
- URLs redirigées complexes

### **Noms de Certificats**

✅ **Bonnes pratiques** :
- `cert_name` : Pas d'espaces, alphanumerique (ex: `MyArt2025`)
- `cert_symbol` : Court, majuscules (ex: `MYART`, max 10 caractères)
- `cert_description` : Descriptif complet (max 500 caractères)

### **Social Links**

- Laisser **vide** si non utilisé (pas de problème)
- Utiliser des **URLs complètes** : `https://x.com/username`
- Vérifier que les URLs sont **accessibles publiquement**

---

## 🔄 Workflow Automatique Complet

```
[Google Sheets] 
    → [Loop Over Items]
        → [1. Get Pricing]
        → [2. Upload File (URL)]
        → [3. Pay with CHECKHC]
        → [4. Certify with Payment]
    → [Success Notification]
```

**Chaque ligne** du CSV génère :
1. ✅ Upload du fichier depuis l'URL
2. ✅ Paiement automatique en CHECKHC
3. ✅ Certification avec métadonnées
4. ✅ NFT créé avec tous les liens sociaux

---

## 📊 Structure du Fichier CSV

```
[EN-TÊTE]
fileUrl,title,description,cert_name,cert_symbol,...

[LIGNE 1 - Exemple complet]
https://drive.google.com/...,My Art,Description,Art2025,ART,https://site.com,...

[LIGNE 2 - Exemple minimal]
https://dropbox.com/...,Document,Description,Doc2025,DOC,,,,,,,,,

[LIGNE 3 - Exemple mixte]
https://cdn.com/...,Photo,Description,Photo2025,PHOTO,https://site.com,,,,https://t.me/channel,,,
```

---

## 🎯 Résumé

| Aspect | Détails |
|--------|---------|
| **Fichier fourni** | `photocertif-batch-example.csv` |
| **Colonnes totales** | 15 (7 obligatoires + 8 optionnelles) |
| **Exemples inclus** | 3 lignes complètes |
| **Compatible** | Excel, Google Sheets, n8n |
| **Format** | CSV UTF-8 |

---

## 💡 Tips

1. **Tester avec 1 ligne** avant de lancer un batch complet
2. **Vérifier les URLs** sont accessibles avant import
3. **Respecter les limites** : cert_symbol max 10 caractères
4. **Laisser vide** les social links non utilisés (ne pas mettre "N/A")
5. **Utiliser Google Sheets** pour édition collaborative

---

## 📞 Support

**Documentation complète** : [README.md](./README.md)  
**Workflows** : `workflow-docs-automated-b2b.json` et `workflow-image2-automated-b2b.json`  
**Repository** : https://github.com/checkhc/n8n-nodes-photocertif

---

**Version** : 2.1.0  
**Date** : 2025-10-08  
**Status** : ✅ Production Ready
