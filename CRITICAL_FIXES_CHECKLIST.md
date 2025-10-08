# ✅ CHECKLIST DES CORRECTIONS CRITIQUES

## 📂 Fichier: `nodes/PhotoCertif/PhotoCertif.node.ts`

---

## 🔴 CORRECTION #1: Ajouter les imports et constantes

**Ligne 9** (après `import axios from 'axios';`)

```typescript
import { URL } from 'url';

// Security and Performance Constants
const REQUEST_TIMEOUT = 30000;          // 30 seconds
const DOWNLOAD_TIMEOUT = 120000;        // 2 minutes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_POLLING_INTERVAL = 10;        // 10 seconds

// Prevent SSRF attacks
function validateUrl(urlString: string): void {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Protocol ${url.protocol} not allowed`);
    }
    const hostname = url.hostname.toLowerCase();
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (blocked.includes(hostname)) {
        throw new Error('Access to internal IPs not allowed');
    }
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
        throw new Error('Access to private IP ranges not allowed');
    }
}
```

---

## 🔴 CORRECTION #2: Valider URL avant téléchargement

**Ligne 491** (juste après `const fileUrl = ...`)

```typescript
const fileUrl = this.getNodeParameter('fileUrl', i) as string;

validateUrl(fileUrl); // ⭐ AJOUTER CETTE LIGNE
```

---

## 🔴 CORRECTION #3: Ajouter timeout + limite taille fichier

**Ligne 493** - Remplacer:
```typescript
const fileResponse = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
    headers: {
        'User-Agent': 'n8n-photocertif/1.0',
    },
});
```

Par:
```typescript
const fileResponse = await axios.get(fileUrl, {
    timeout: DOWNLOAD_TIMEOUT,          // ⭐ AJOUTER
    maxContentLength: MAX_FILE_SIZE,    // ⭐ AJOUTER
    maxBodyLength: MAX_FILE_SIZE,       // ⭐ AJOUTER
    responseType: 'arraybuffer',
    headers: {
        'User-Agent': 'n8n-photocertif/1.0',
    },
});
```

---

## 🔴 CORRECTION #4: Ajouter timeout à TOUTES les requêtes

### Ligne 526 (POST upload)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

### Ligne 546 (GET status)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

### Ligne 579 (POST certify)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

### Ligne 631 (GET status dans polling)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

### Ligne 676 (GET download)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

### Ligne 692 (GET pricing)
```typescript
{
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: {
```

---

## 🔴 CORRECTION #5: Forcer minimum polling interval

**Ligne 618** - Remplacer:
```typescript
const pollingInterval = this.getNodeParameter('pollingInterval', i, 300) as number;
```

Par:
```typescript
const pollingInterval = Math.max(
    MIN_POLLING_INTERVAL,  // ⭐ Force minimum 10 secondes
    this.getNodeParameter('pollingInterval', i, 300) as number
);
```

---

## 🔴 CORRECTION #6: Sanitize error messages

**Lignes 722-726** - Remplacer:
```typescript
json: {
    error: error.message || 'Unknown error',
    status_code: error.response?.status,
    details: error.response?.data,
},
```

Par:
```typescript
json: {
    error: 'Request failed',
    status_code: error.response?.status,
    message: error.response?.data?.error || error.message || 'Unknown error',
    // Ne PAS inclure error.response?.data complet
},
```

---

## 🧪 COMMANDES POUR APPLIQUER

```bash
# 1. Ouvrir le fichier
code /home/greg/n8n-nodes-photocertif/nodes/PhotoCertif/PhotoCertif.node.ts

# 2. Appliquer les 6 corrections ci-dessus

# 3. Compiler
cd /home/greg/n8n-nodes-photocertif
yarn build

# 4. Vérifier compilation
# Si OK → Continuer
# Si erreur → Vérifier syntaxe

# 5. Créer nouveau package
npm pack

# 6. Installer dans n8n
cd ~/.n8n
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz

# 7. Redémarrer n8n
pkill -f "node.*n8n"
n8n start
```

---

## ✅ TESTS DE VALIDATION

### Test 1: SSRF bloqué
```json
{
  "fileUrl": "http://localhost:6379/",
  "title": "Test"
}
```
**Résultat attendu:** ❌ Erreur "Access to internal IPs not allowed"

### Test 2: Timeout fonctionne
```json
{
  "fileUrl": "http://httpstat.us/200?sleep=35000",
  "title": "Test"
}
```
**Résultat attendu:** ❌ Timeout après 30 secondes

### Test 3: Fichier trop gros
Essayer un fichier > 10MB
**Résultat attendu:** ❌ Erreur de limite dépassée

### Test 4: Polling minimum
Dans workflow, mettre `pollingInterval: 1`
**Résultat attendu:** ✅ Utilisera 10 secondes minimum

### Test 5: Erreur sanitisée
Provoquer une erreur API
**Résultat attendu:** ✅ Pas de `details` dans la réponse d'erreur

---

## 📊 RÉSUMÉ

| # | Correction | Ligne(s) | Priorité |
|---|-----------|----------|----------|
| 1 | Imports + validateUrl() | 9 | 🔴 CRITIQUE |
| 2 | Appeler validateUrl() | 491 | 🔴 CRITIQUE |
| 3 | Timeout + limite fichier | 493 | 🔴 CRITIQUE |
| 4 | Timeout 6 autres requêtes | 526,546,579,631,676,692 | 🔴 CRITIQUE |
| 5 | Min polling interval | 618 | 🟡 HAUTE |
| 6 | Sanitize erreurs | 722-726 | 🔴 CRITIQUE |

**Total:** 6 corrections | **Temps:** 30 minutes | **Impact:** MAJEUR

---

## 🎯 VERSION FINALE

Après corrections, mettre à jour:

```json
// package.json
"version": "1.0.2"
```

```bash
git add .
git commit -m "security: Fix 6 critical vulnerabilities (SSRF, timeouts, data exposure)"
git push origin main
```

---

**BESOIN D'AIDE?** Regarde `SECURITY_AUDIT_CRITICAL.md` pour plus de détails sur chaque vulnérabilité.
