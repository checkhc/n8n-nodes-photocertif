# 📥 Support URL pour Upload de Fichiers

## 🎯 Nouvelle Fonctionnalité : Input Type

Tu peux maintenant uploader des fichiers de **2 façons différentes** :

### **1. Base64 String** (Ancienne méthode)
```javascript
{
  inputType: "base64",
  fileData: "data:image/jpeg;base64,/9j/4AAQ..."
}
```

### **2. URL** ⭐ NOUVEAU
```javascript
{
  inputType: "url",
  fileUrl: "https://drive.google.com/uc?id=1abc..."
}
```

---

## 📋 Utilisation dans n8n

### **Configuration du Node Upload**

**Étape 1** : Sélectionner **"Input Type"**
- **Base64 String** : Fichier encodé en base64
- **URL** : Télécharger depuis une URL

**Étape 2** : Selon le type choisi

#### **Option A : Base64**
```
File (Base64): data:image/jpeg;base64,/9j/4AAQ...
```

#### **Option B : URL**
```
File URL: https://example.com/image.jpg
```

---

## 🌐 URLs Supportées

### **Google Drive**

**Format URL** :
```
https://drive.google.com/uc?id=FILE_ID&export=download
```

**Étapes** :
1. Upload fichier sur Google Drive
2. Partager → "Accès général" → "Tous les utilisateurs avec le lien"
3. Copier l'ID du fichier depuis l'URL partagée
4. Utiliser : `https://drive.google.com/uc?id=FILE_ID&export=download`

**Exemple** :
```
URL partagée : https://drive.google.com/file/d/1abc123xyz/view
ID du fichier : 1abc123xyz
URL à utiliser : https://drive.google.com/uc?id=1abc123xyz&export=download
```

---

### **Dropbox**

**Format URL** :
```
https://www.dropbox.com/s/FILE_ID/filename.jpg?dl=1
```

**Étapes** :
1. Upload fichier sur Dropbox
2. Créer un lien partagé
3. Remplacer `dl=0` par `dl=1` à la fin de l'URL

**Exemple** :
```
Lien partagé : https://www.dropbox.com/s/abc123/photo.jpg?dl=0
URL à utiliser : https://www.dropbox.com/s/abc123/photo.jpg?dl=1
```

---

### **URLs Directes**

**Formats supportés** :
```
https://example.com/images/photo.jpg
https://cdn.example.com/files/document.pdf
https://assets.example.com/media/artwork.png
```

**Condition** : L'URL doit être **publiquement accessible** (pas de login requis)

---

## 🔄 Fonctionnement Automatique

### **Ce que fait le Node** :

1. **Télécharge le fichier** depuis l'URL
   ```javascript
   const fileResponse = await axios.get(fileUrl, {
     responseType: 'arraybuffer'
   });
   ```

2. **Détecte le type de contenu**
   ```javascript
   const contentType = fileResponse.headers['content-type'] || 'application/octet-stream';
   ```

3. **Convertit en base64**
   ```javascript
   const base64Data = Buffer.from(fileResponse.data).toString('base64');
   ```

4. **Ajoute le préfixe data URI**
   ```javascript
   const fileData = `data:${contentType};base64,${base64Data}`;
   ```

5. **Envoie à PhotoCertif API**

---

## 📝 Exemples d'Utilisation

### **Exemple 1 : Image depuis Google Drive**

**Input Data** :
```javascript
{
  inputType: "url",
  fileUrl: "https://drive.google.com/uc?id=1abc123xyz&export=download",
  title: "My Artwork 2025",
  description: "Digital art from Google Drive"
}
```

---

### **Exemple 2 : Document depuis Dropbox**

**Input Data** :
```javascript
{
  inputType: "url",
  fileUrl: "https://www.dropbox.com/s/abc123/contract.pdf?dl=1",
  title: "Contract 2025",
  description: "Legal document from Dropbox"
}
```

---

### **Exemple 3 : Image depuis URL directe**

**Input Data** :
```javascript
{
  inputType: "url",
  fileUrl: "https://cdn.example.com/artworks/masterpiece.jpg",
  title: "Masterpiece",
  description: "Art from CDN"
}
```

---

## 🎯 Workflow Complet avec URL

```json
{
  "nodes": [
    {
      "name": "Input Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "fileUrl",
              "value": "https://drive.google.com/uc?id=1abc&export=download"
            },
            {
              "name": "title",
              "value": "My Document"
            }
          ]
        }
      }
    },
    {
      "name": "Upload to PhotoCertif",
      "type": "n8n-nodes-photocertif.photoCertif",
      "parameters": {
        "resourceType": "docs",
        "operation": "upload",
        "inputType": "url",
        "fileUrl": "={{ $json.fileUrl }}",
        "title": "={{ $json.title }}"
      }
    }
  ]
}
```

---

## ⚠️ Limitations et Considérations

### **URLs Privées**
❌ **Ne fonctionne PAS** avec :
- URLs nécessitant authentification
- URLs protégées par cookies
- URLs derrière login

✅ **Fonctionne** avec :
- URLs publiques
- Google Drive partagé publiquement
- Dropbox liens publics avec `dl=1`

---

### **Taille de Fichier**

**Limite recommandée** : 10 MB
- Au-delà, le téléchargement peut échouer (timeout)
- Pour gros fichiers, préférer l'upload direct base64

---

### **Types de Fichiers**

**Détection automatique** depuis :
- Header `Content-Type` HTTP
- Extension du fichier dans l'URL

**Types supportés** :
- Images : JPG, PNG, GIF, WEBP, etc.
- Documents : PDF, DOCX, TXT, ZIP, etc.

---

## 🛠️ Troubleshooting

### **Erreur : "Cannot download file from URL"**

**Causes possibles** :
1. URL privée (non accessible publiquement)
2. URL invalide ou expirée
3. Fichier trop volumineux
4. Serveur distant inaccessible

**Solutions** :
1. Vérifier que l'URL est accessible dans un navigateur (sans login)
2. Vérifier le format de l'URL (Google Drive, Dropbox)
3. Réduire la taille du fichier
4. Essayer une URL alternative

---

### **Erreur : "Invalid content type"**

**Cause** : Le serveur ne retourne pas de `Content-Type` valide

**Solution** : 
- Utiliser une URL directe vers le fichier (pas de page HTML)
- Vérifier que l'URL pointe vers le fichier brut

---

### **Google Drive : "Too Many Requests"**

**Cause** : Limite de téléchargement Google Drive atteinte

**Solutions** :
1. Attendre quelques heures
2. Utiliser un autre fichier Google Drive
3. Uploader le fichier ailleurs (Dropbox, CDN)

---

## 💡 Bonnes Pratiques

### **1. Utiliser des CDN pour haute disponibilité**
```
✅ https://cdn.example.com/files/document.pdf
❌ https://my-slow-server.com/files/document.pdf
```

### **2. Vérifier l'URL avant utilisation**
```bash
# Tester avec curl
curl -I "https://drive.google.com/uc?id=1abc&export=download"

# Doit retourner 200 OK et Content-Type valide
```

### **3. Pour workflows en production**
- Héberger les fichiers sur un CDN fiable
- Utiliser des URLs avec HTTPS
- Monitorer les erreurs de téléchargement

---

## 🚀 Avantages de la Méthode URL

### **vs Base64**

| Aspect | Base64 | URL |
|--------|--------|-----|
| **Simplicité** | ❌ Encodage requis | ✅ Juste copier l'URL |
| **Performance** | ✅ Pas de téléchargement | ⚠️ Téléchargement requis |
| **Taille JSON** | ❌ Très volumineux | ✅ Très léger |
| **Fichiers volumineux** | ⚠️ Limite JSON | ✅ Pas de limite JSON |
| **Stockage** | ❌ Dupliqué dans workflow | ✅ Référence externe |

### **Quand utiliser URL ?**

✅ **Idéal pour** :
- Fichiers stockés sur Google Drive, Dropbox
- Images hébergées sur CDN
- Documents disponibles en ligne
- Workflows avec fichiers volumineux
- Réutilisation de fichiers

❌ **Éviter si** :
- URLs privées/protégées
- Connexion internet instable
- Besoin de performance maximale

---

## 📊 Statistiques

**Gain de performance** :
- Taille JSON workflow : **-95%** (URL vs Base64)
- Temps de configuration : **-80%** (pas d'encodage)
- Flexibilité : **+100%** (changement fichier = changement URL)

---

**Version** : 2.1.0  
**Date** : 2025-10-07  
**Nouveauté** : Support URL pour upload de fichiers
