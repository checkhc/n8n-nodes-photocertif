# 📎 File Extension Parameter - Guide

## 🎯 Problème Résolu

Les URLs de **Google Drive** et services similaires ne contiennent **pas l'extension** du fichier :

```
❌ https://drive.google.com/uc?id=1A2B3C4D5E&export=download
❌ https://www.dropbox.com/s/xyz123/download
```

**Conséquences** :
- ❌ Nom de fichier incorrect sur le serveur
- ❌ Détection MIME type difficile
- ❌ Validation des fichiers problématique

---

## ✅ Solution : Paramètre `file_extension`

Un nouveau champ permet de **spécifier manuellement l'extension** du fichier.

---

## 📋 Utilisation dans n8n

### **1. Node "Input Data"**

Ajouter le champ `file_extension` :

```json
{
  "fileUrl": "https://drive.google.com/uc?id=YOUR_FILE_ID&export=download",
  "title": "My Document",
  "description": "Description",
  "file_extension": "pdf"   // ⭐ NOUVEAU CHAMP
}
```

### **2. Node "Upload Document"**

Le paramètre "File Extension" est maintenant visible :

**Configuration** :
- **Nom** : File Extension
- **Type** : string
- **Valeur** : `={{ $('Input Data').item.json.file_extension }}`

**Visible uniquement si** :
- Operation = `upload`
- Input Type = `url`

---

## 🎨 Exemple Complet

### **Workflow B2B**

```json
{
  "nodes": [
    {
      "name": "Input Data",
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "fileUrl",
              "value": "https://drive.google.com/uc?id=1ABC...&export=download"
            },
            {
              "name": "title",
              "value": "Contract 2025"
            },
            {
              "name": "file_extension",
              "value": "pdf"   // ⭐ Extension du fichier
            }
          ]
        }
      }
    },
    {
      "name": "Upload Document",
      "parameters": {
        "resourceType": "docs",
        "operation": "upload",
        "inputType": "url",
        "fileUrl": "={{ $('Input Data').item.json.fileUrl }}",
        "title": "={{ $('Input Data').item.json.title }}",
        "fileExtension": "={{ $('Input Data').item.json.file_extension }}"
      }
    }
  ]
}
```

---

## 📝 Extensions Supportées

### **Documents**
- `pdf` - PDF documents
- `txt` - Text files
- `doc` - Microsoft Word (legacy)
- `docx` - Microsoft Word

### **Archives**
- `zip` - ZIP archive
- `rar` - RAR archive

### **Images**
- `jpg` / `jpeg` - JPEG images
- `png` - PNG images
- `webp` - WebP images
- `gif` - GIF images

---

## 🔧 Fonctionnement Technique

### **Côté n8n Node**

```typescript
// Paramètre défini dans PhotoCertif.node.ts
{
  displayName: 'File Extension',
  name: 'fileExtension',
  type: 'string',
  default: 'pdf',
  placeholder: 'pdf, zip, jpg, png, docx, etc.',
  description: 'File extension (required for URL uploads)',
}
```

### **Envoi au Serveur**

```typescript
const requestBody = {
  file: fileData,          // Base64 data
  title: title,
  description: description,
  file_extension: fileExtension  // ⭐ Extension fournie
};
```

### **Côté Serveur API**

```typescript
// Dans /api/storage/docs/upload/iv_route/route.ts
const providedFileExtension = body.file_extension || '';

// Utilisation pour nommer le fichier
let finalExtension = extension || 'pdf';
if (providedFileExtension) {
  finalExtension = providedFileExtension.replace(/^\./, '');
}

const fullFileName = `${fileName}.${finalExtension}`;
```

---

## 🧪 Tests

### **Test 1 : PDF Google Drive**

```json
{
  "fileUrl": "https://drive.google.com/uc?id=1ABC...&export=download",
  "title": "Test PDF",
  "file_extension": "pdf"
}
```

**Résultat attendu** :
- ✅ Fichier nommé : `Test PDF.pdf`
- ✅ MIME type : `application/pdf`
- ✅ Validation : OK

### **Test 2 : ZIP Dropbox**

```json
{
  "fileUrl": "https://www.dropbox.com/s/xyz123/download",
  "title": "Archive",
  "file_extension": "zip"
}
```

**Résultat attendu** :
- ✅ Fichier nommé : `Archive.zip`
- ✅ MIME type : `application/zip`
- ✅ Validation : OK

### **Test 3 : Image JPG**

```json
{
  "fileUrl": "https://example.com/download?file=photo",
  "title": "Photo",
  "file_extension": "jpg"
}
```

**Résultat attendu** :
- ✅ Fichier nommé : `Photo.jpg`
- ✅ MIME type : `image/jpeg`
- ✅ Validation : OK

---

## ⚠️ Notes Importantes

### **1. Priorité Extension**

Si une extension est **fournie** ET **détectée** dans le nom :
- ✅ **Extension fournie** = prioritaire
- ⚠️ Extension détectée = ignorée

**Exemple** :
```json
{
  "title": "document.txt",
  "file_extension": "pdf"
}
```
**Résultat** : `document.txt.pdf` (extension ajoutée)

### **2. Format Extension**

Accepte avec ou sans point :
- ✅ `"pdf"` → `document.pdf`
- ✅ `".pdf"` → `document.pdf`
- ✅ `"PDF"` → `document.pdf` (lowercase automatique)

### **3. Validation**

L'extension fournie est **validée** contre la liste des extensions supportées.

**Si extension invalide** :
```
❌ Error: File type not supported. Supported formats: .pdf, .txt, .zip, .rar, .jpg, ...
```

---

## 🔄 Migration Workflows Existants

### **Workflows sans file_extension**

✅ **Continuent de fonctionner** sans modification

**Comportement** :
- Extension détectée depuis le nom si présent
- Sinon, default = `'pdf'`

### **Ajouter file_extension (Recommandé)**

Pour **Google Drive** et URLs sans extension :

**Avant** :
```json
{
  "fileUrl": "https://drive.google.com/...",
  "title": "Document"
}
```

**Après** :
```json
{
  "fileUrl": "https://drive.google.com/...",
  "title": "Document",
  "file_extension": "pdf"  // ⭐ AJOUT
}
```

---

## 📊 Exemples par Cas d'Usage

### **Cas 1 : Contrats PDF (Google Drive)**

```json
{
  "fileUrl": "https://drive.google.com/uc?id=CONTRACT_2025&export=download",
  "title": "Contract B2B 2025",
  "description": "Annual contract",
  "cert_name": "Contract2025",
  "file_extension": "pdf"
}
```

### **Cas 2 : Archives ZIP (Dropbox)**

```json
{
  "fileUrl": "https://www.dropbox.com/s/xyz/download",
  "title": "Project Files",
  "description": "Complete project archive",
  "cert_name": "ProjectFiles",
  "file_extension": "zip"
}
```

### **Cas 3 : Images JPG (URL directe)**

```json
{
  "fileUrl": "https://example.com/api/download?token=abc123",
  "title": "Product Photo",
  "description": "Marketing image",
  "cert_name": "ProductPhoto",
  "file_extension": "jpg"
}
```

### **Cas 4 : Documents Word**

```json
{
  "fileUrl": "https://onedrive.live.com/download?id=DOC123",
  "title": "Report 2025",
  "description": "Annual report",
  "cert_name": "Report2025",
  "file_extension": "docx"
}
```

---

## 🚀 Déploiement

### **1. Mettre à Jour le Node n8n**

```bash
cd ~/.n8n
npm install /path/to/n8n-nodes-photocertif-1.0.1.tgz
```

### **2. Redémarrer n8n**

```bash
pkill -f "node.*n8n"
n8n start
```

### **3. Vérifier Installation**

Dans n8n :
1. Ouvrir un workflow
2. Ajouter node "PhotoCertif"
3. Operation = `upload`
4. Input Type = `url`
5. **Vérifier présence de "File Extension"** ✅

---

## ✅ Checklist de Vérification

Après mise à jour :

- [ ] n8n redémarré
- [ ] Node PhotoCertif installé (version 1.0.1)
- [ ] Paramètre "File Extension" visible
- [ ] Test avec Google Drive URL
- [ ] Fichier créé avec bonne extension
- [ ] Workflow B2B fonctionne

---

## 🆘 Troubleshooting

### **Erreur : "Paramètre File Extension non visible"**

**Cause** : Node non mis à jour

**Solution** :
```bash
cd ~/.n8n
npm list n8n-nodes-photocertif
# Doit afficher version 1.0.1 ou supérieure

# Si version ancienne:
npm install /path/to/n8n-nodes-photocertif-1.0.1.tgz
pkill -f "node.*n8n"
n8n start
```

### **Erreur : "File type not supported"**

**Cause** : Extension invalide ou non supportée

**Solution** :
- Vérifier extension dans la liste supportée
- Utiliser extension sans point : `"pdf"` pas `".pdf"`
- Vérifier casse : `"pdf"` pas `"PDF"`

### **Fichier avec mauvaise extension**

**Cause** : file_extension non fourni ou vide

**Solution** :
```json
{
  "file_extension": "pdf"  // Toujours spécifier pour URLs sans extension
}
```

---

**Dernière mise à jour** : 2025-01-08  
**Version node** : 1.0.1  
**Status** : ✅ Production Ready
