# 🚨 AUDIT SÉCURITÉ - POINTS CRITIQUES

## ⚠️ VULNÉRABILITÉS À CORRIGER IMMÉDIATEMENT

### 🔴 CRITIQUE #1: SSRF (Server-Side Request Forgery)
**Fichier:** `nodes/PhotoCertif/PhotoCertif.node.ts` - Ligne 491  
**Risque:** Un attaquant peut scanner le réseau interne ou accéder à des services privés

#### Problème actuel:
```typescript
// ❌ VULNÉRABLE - Accepte n'importe quelle URL
const fileUrl = this.getNodeParameter('fileUrl', i) as string;
const fileResponse = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
});
```

#### Attaque possible:
```json
{
  "fileUrl": "http://localhost:6379/",           // Redis interne
  "fileUrl": "http://169.254.169.254/latest/",   // AWS metadata
  "fileUrl": "http://192.168.1.1/admin",         // Réseau privé
  "fileUrl": "file:///etc/passwd"                // Fichiers système
}
```

#### ✅ Solution:
```typescript
// Ajouter AVANT la ligne 491
function validateUrl(urlString: string): void {
    const url = new URL(urlString);
    
    // 1. Autoriser uniquement HTTP/HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Protocol ${url.protocol} non autorisé`);
    }
    
    // 2. Bloquer IPs internes
    const blockedHosts = [
        'localhost', '127.0.0.1', '0.0.0.0', '::1',
        '169.254.169.254',  // AWS metadata
    ];
    
    if (blockedHosts.includes(url.hostname.toLowerCase())) {
        throw new Error('Accès aux IPs internes interdit');
    }
    
    // 3. Bloquer plages IP privées
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(url.hostname)) {
        throw new Error('Accès aux réseaux privés interdit');
    }
}

// Utiliser:
const fileUrl = this.getNodeParameter('fileUrl', i) as string;
validateUrl(fileUrl);  // ⭐ AJOUTER CETTE LIGNE
const fileResponse = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
});
```

**Impact si non corrigé:** Un attaquant peut accéder à vos services internes, voler des credentials AWS, scanner votre réseau.

---

### 🔴 CRITIQUE #2: Absence de Timeout sur les Requêtes
**Fichier:** `nodes/PhotoCertif/PhotoCertif.node.ts` - Lignes 493, 526, 546, 579, 631, 676, 692  
**Risque:** Le workflow peut rester bloqué indéfiniment

#### Problème actuel:
```typescript
// ❌ PAS DE TIMEOUT - Peut bloquer indéfiniment
const response = await axios.get(url, {
    headers: { ... }
});
```

#### ✅ Solution:
```typescript
// Ajouter en haut du fichier (après les imports):
const REQUEST_TIMEOUT = 30000;       // 30 secondes
const DOWNLOAD_TIMEOUT = 120000;     // 2 minutes pour téléchargements

// Modifier TOUTES les requêtes axios:
const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER
    headers: { ... }
});

// Pour les téléchargements de fichiers (ligne 493):
const fileResponse = await axios.get(fileUrl, {
    timeout: DOWNLOAD_TIMEOUT,  // ⭐ AJOUTER (2 min)
    responseType: 'arraybuffer',
    headers: { 'User-Agent': 'n8n-photocertif/1.0' },
});
```

**Impact si non corrigé:** Workflows bloqués, consommation mémoire, serveur n8n qui plante.

---

### 🔴 CRITIQUE #3: Fuite d'Informations Sensibles dans les Erreurs
**Fichier:** `nodes/PhotoCertif/PhotoCertif.node.ts` - Lignes 718-729  
**Risque:** Exposition de clés API, tokens, chemins internes

#### Problème actuel:
```typescript
// ❌ EXPOSE TOUT - Y compris données sensibles
returnData.push({
    json: {
        error: error.message,
        status_code: error.response?.status,
        details: error.response?.data,  // ⚠️ Peut contenir API keys, tokens, etc.
    },
});
```

#### ✅ Solution:
```typescript
// Remplacer les lignes 718-729 par:
returnData.push({
    json: {
        error: 'Request failed',
        status_code: error.response?.status,
        // ⭐ NE PAS inclure error.response?.data directement
        message: error.response?.data?.error || error.message,
        // NE JAMAIS exposer: tokens, keys, stack traces, paths internes
    },
    pairedItem: { item: i },
});
```

**Impact si non corrigé:** Clés API exposées dans les logs n8n, informations système révélées.

---

### 🟡 HAUTE PRIORITÉ #4: Pas de Limite de Taille des Fichiers
**Fichier:** `nodes/PhotoCertif/PhotoCertif.node.ts` - Ligne 502  
**Risque:** Épuisement mémoire (Out of Memory)

#### Problème actuel:
```typescript
// ❌ CHARGE N'IMPORTE QUELLE TAILLE EN MÉMOIRE
const fileResponse = await axios.get(fileUrl, {
    responseType: 'arraybuffer',  // Tout en mémoire
});
const base64Data = Buffer.from(fileResponse.data).toString('base64');
```

#### ✅ Solution:
```typescript
// Ajouter en haut du fichier:
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Modifier le téléchargement:
const fileResponse = await axios.get(fileUrl, {
    timeout: DOWNLOAD_TIMEOUT,
    responseType: 'arraybuffer',
    maxContentLength: MAX_FILE_SIZE,  // ⭐ AJOUTER
    maxBodyLength: MAX_FILE_SIZE,     // ⭐ AJOUTER
    headers: { 'User-Agent': 'n8n-photocertif/1.0' },
});

// Vérifier la taille reçue:
if (fileResponse.data.length > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop gros: ${(fileResponse.data.length / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`);
}
```

**Impact si non corrigé:** Crash du serveur n8n, consommation RAM excessive.

---

### 🟡 HAUTE PRIORITÉ #5: Pas de Protection contre le Spam de Polling
**Fichier:** `nodes/PhotoCertif/PhotoCertif.node.ts` - Ligne 618  
**Risque:** DDoS involontaire de l'API PhotoCertif

#### Problème actuel:
```typescript
// ❌ L'utilisateur peut mettre 1 seconde
const pollingInterval = this.getNodeParameter('pollingInterval', i, 300) as number;
```

#### ✅ Solution:
```typescript
// Ligne 618 - Ajouter validation:
const MIN_POLLING_INTERVAL = 10; // 10 secondes minimum
const pollingInterval = Math.max(
    MIN_POLLING_INTERVAL,  // ⭐ FORCER minimum 10 secondes
    this.getNodeParameter('pollingInterval', i, 300) as number
);

console.log(`Polling every ${pollingInterval} seconds (minimum: ${MIN_POLLING_INTERVAL}s)`);
```

**Impact si non corrigé:** Rate limiting API, ban de votre IP, surcharge serveur.

---

## 🔧 CORRECTIONS RAPIDES (30 minutes)

### Fichier à modifier: `nodes/PhotoCertif/PhotoCertif.node.ts`

#### 1. Ajouter après les imports (ligne 10):
```typescript
import { URL } from 'url';

// Configuration constants
const REQUEST_TIMEOUT = 30000;
const DOWNLOAD_TIMEOUT = 120000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_POLLING_INTERVAL = 10;
```

#### 2. Ajouter fonction de validation (ligne 11):
```typescript
function validateUrl(urlString: string): void {
    let url: URL;
    try {
        url = new URL(urlString);
    } catch {
        throw new Error('URL invalide');
    }
    
    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Protocol ${url.protocol} non autorisé`);
    }
    
    const hostname = url.hostname.toLowerCase();
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    
    if (blockedHosts.includes(hostname)) {
        throw new Error('Accès aux IPs internes interdit');
    }
    
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
        throw new Error('Accès aux réseaux privés interdit');
    }
}
```

#### 3. Ligne 491 - Valider URL:
```typescript
const fileUrl = this.getNodeParameter('fileUrl', i) as string;
validateUrl(fileUrl); // ⭐ AJOUTER
```

#### 4. Ligne 493 - Ajouter timeout et limite:
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

#### 5. Ligne 526, 546, 579, 631, 676, 692 - Ajouter timeout:
```typescript
const response = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,  // ⭐ AJOUTER à toutes les requêtes
    headers: { ... }
});
```

#### 6. Ligne 618 - Forcer minimum polling:
```typescript
const pollingInterval = Math.max(MIN_POLLING_INTERVAL, this.getNodeParameter('pollingInterval', i, 300) as number);
```

#### 7. Lignes 722-726 - Sanitize errors:
```typescript
returnData.push({
    json: {
        error: 'Request failed',
        status_code: error.response?.status,
        message: error.response?.data?.error || error.message,
        // ⛔ NE PAS inclure error.response?.data
    },
    pairedItem: { item: i },
});
```

---

## 📋 CHECKLIST DE VÉRIFICATION

Après corrections, vérifier:

- [ ] `validateUrl()` appelée avant `axios.get(fileUrl)` (ligne 491)
- [ ] Toutes les requêtes axios ont un `timeout` (7 endroits)
- [ ] `maxContentLength` et `maxBodyLength` ajoutés (ligne 493)
- [ ] `pollingInterval` a un minimum de 10 secondes (ligne 618)
- [ ] Erreurs ne contiennent plus `error.response?.data` complet (ligne 722)
- [ ] Tests: URL interne bloquée (ex: `http://localhost`)
- [ ] Tests: Timeout fonctionne (URL qui ne répond pas)
- [ ] Tests: Fichier > 10MB rejeté

---

## 🧪 COMMANDES DE TEST

```bash
cd /home/greg/n8n-nodes-photocertif

# 1. Appliquer les corrections
# (Éditer nodes/PhotoCertif/PhotoCertif.node.ts)

# 2. Recompiler
yarn build

# 3. Rebuild package
npm pack

# 4. Réinstaller dans n8n
cd ~/.n8n
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.1.tgz

# 5. Redémarrer n8n
pkill -f "node.*n8n"
n8n start

# 6. Tester workflow avec:
# - URL interne (doit être bloquée): http://localhost
# - URL lente (doit timeout): http://httpstat.us/200?sleep=35000
# - Gros fichier (doit être rejeté): fichier > 10MB
```

---

## 📊 IMPACT DES CORRECTIONS

| Vulnérabilité | Sans Fix | Avec Fix |
|--------------|----------|----------|
| **SSRF** | 🔴 Réseau interne accessible | ✅ Bloqué |
| **Timeout** | 🔴 Workflow bloqué indéfiniment | ✅ Timeout 30s |
| **Mémoire** | 🔴 Crash avec gros fichiers | ✅ Limite 10MB |
| **Données sensibles** | 🔴 API keys exposées | ✅ Logs sécurisés |
| **Rate limit** | 🔴 Spam API possible | ✅ Minimum 10s |

**Temps de correction estimé:** 30-45 minutes  
**Complexité:** Faible (modifications simples)  
**Bénéfice:** CRITIQUE pour la sécurité

---

## 🚀 APRÈS LES CORRECTIONS

1. **Commit les changements:**
```bash
cd /home/greg/n8n-nodes-photocertif
git add nodes/PhotoCertif/PhotoCertif.node.ts
git commit -m "security: Fix critical vulnerabilities (SSRF, timeouts, data exposure)"
git push origin main
```

2. **Mettre à jour la version:**
```json
// package.json
"version": "1.0.2",  // Incrémenter
```

3. **Documenter dans CHANGELOG:**
```markdown
## [1.0.2] - 2025-01-08
### Security
- Fixed SSRF vulnerability (URL validation)
- Added request timeouts (30s/120s)
- Added file size limits (10MB)
- Sanitized error messages
- Added minimum polling interval (10s)
```

---

**Questions? Besoin d'aide pour implémenter?** Ping moi !
