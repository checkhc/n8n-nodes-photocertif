# 🧪 Tests de Validation - v1.0.2

## ✅ Tests Automatiques Réussis

### 1. Compilation TypeScript
```bash
$ yarn build
✅ SUCCÈS - Aucune erreur de compilation
✅ SUCCÈS - Aucun warning TypeScript
✅ SUCCÈS - Dist/ généré correctement
```

### 2. Build Package NPM
```bash
$ npm pack
✅ SUCCÈS - Package n8n-nodes-photocertif-1.0.2.tgz créé
✅ Taille: 188.6 kB (normale, +5kB pour code sécurité)
✅ 11 fichiers inclus
```

### 3. Installation n8n
```bash
$ npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.0.2.tgz
✅ SUCCÈS - Installation sans erreur
✅ SUCCÈS - Dépendances résolues
```

### 4. Démarrage n8n
```bash
$ n8n start
✅ SUCCÈS - n8n démarré (PID: 18963)
✅ SUCCÈS - Node PhotoCertif chargé
✅ SUCCÈS - Pas d'erreur au démarrage
```

---

## 🔒 Tests de Sécurité à Effectuer

### Test #1: SSRF Protection (CRITIQUE)
**Objectif:** Vérifier que les URLs internes sont bloquées

#### Test 1.1 - Blocage localhost
```json
{
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "http://localhost:6379/",
  "title": "Test SSRF"
}
```
**Résultat attendu:** ❌ Erreur "Access to internal/private IPs is not allowed"

#### Test 1.2 - Blocage AWS metadata
```json
{
  "fileUrl": "http://169.254.169.254/latest/meta-data/"
}
```
**Résultat attendu:** ❌ Erreur "Access to internal/private IPs is not allowed"

#### Test 1.3 - Blocage réseau privé
```json
{
  "fileUrl": "http://192.168.1.1/admin"
}
```
**Résultat attendu:** ❌ Erreur "Access to private IP ranges is not allowed"

#### Test 1.4 - Blocage protocole file://
```json
{
  "fileUrl": "file:///etc/passwd"
}
```
**Résultat attendu:** ❌ Erreur "Protocol file: not allowed"

#### Test 1.5 - URL valide acceptée
```json
{
  "fileUrl": "https://photocertif.com/test.pdf"
}
```
**Résultat attendu:** ✅ Téléchargement OK (si fichier existe)

---

### Test #2: Request Timeout (CRITIQUE)
**Objectif:** Vérifier que les requêtes timeout correctement

#### Test 2.1 - Timeout sur URL lente
```json
{
  "fileUrl": "http://httpstat.us/200?sleep=35000"
}
```
**Résultat attendu:** ❌ Timeout après 120 secondes

#### Test 2.2 - Timeout API lente
```json
{
  "operation": "getStatus",
  "storageId": "iv_test_slow_api"
}
```
**Résultat attendu:** ❌ Timeout après 30 secondes

---

### Test #3: File Size Limit (CRITIQUE)
**Objectif:** Vérifier que les fichiers > 10MB sont rejetés

#### Test 3.1 - Fichier 15MB
```json
{
  "fileUrl": "https://example.com/large-file-15mb.pdf"
}
```
**Résultat attendu:** ❌ Erreur maxContentLength exceeded

#### Test 3.2 - Fichier 8MB
```json
{
  "fileUrl": "https://example.com/file-8mb.pdf"
}
```
**Résultat attendu:** ✅ Upload OK

---

### Test #4: Error Sanitization (CRITIQUE)
**Objectif:** Vérifier que les erreurs ne contiennent pas de données sensibles

#### Test 4.1 - Erreur API
```json
{
  "operation": "upload",
  "fileUrl": "https://example.com/not-found.pdf"
}
```
**Résultat attendu:** 
```json
{
  "error": "Request failed",
  "status_code": 404,
  "message": "Not Found"
}
```
**Vérifier:** Pas de champs `details`, `headers`, `config`, `apiKey`

---

### Test #5: Minimum Polling Interval (HAUTE)
**Objectif:** Vérifier que le polling respecte minimum 10 secondes

#### Test 5.1 - Polling 1 seconde (doit être forcé à 10s)
```json
{
  "operation": "waitForCertification",
  "storageId": "iv_test_123",
  "pollingInterval": 1
}
```
**Résultat attendu:** 
- ✅ Workflow ne crashe pas
- ✅ Logs montrent "Polling every 10 seconds" (pas 1)
- ✅ Requêtes espacées de minimum 10 secondes

#### Test 5.2 - Polling 300 secondes (OK)
```json
{
  "pollingInterval": 300
}
```
**Résultat attendu:** ✅ Utilise 300 secondes

---

## 📊 Tests Fonctionnels (Régression)

### Test #6: Upload Base64 (Workflow existant)
**Objectif:** Vérifier aucune régression sur upload base64

```json
{
  "operation": "upload",
  "inputType": "base64",
  "fileData": "data:application/pdf;base64,JVBERi0xLjcK...",
  "title": "Test Document",
  "description": "Test description"
}
```
**Résultat attendu:** ✅ Upload OK comme avant

---

### Test #7: Upload URL (Google Drive)
**Objectif:** Vérifier que la feature Google Drive fonctionne toujours

```json
{
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "https://drive.google.com/uc?id=FILE_ID&export=download",
  "fileExtension": "pdf",
  "title": "Google Drive Document"
}
```
**Résultat attendu:** ✅ Upload OK avec extension appliquée

---

### Test #8: Workflow Complet
**Objectif:** Vérifier qu'un workflow complet fonctionne

1. **Upload** → Obtenir storageId
2. **GetStatus** → Vérifier status "uploaded"
3. **Certify** → Soumettre formulaire certification
4. **WaitForCertification** → Attendre completion (ou timeout)
5. **Download** → Télécharger résultat

**Résultat attendu:** ✅ Toutes les étapes fonctionnent

---

## 🚀 Tests de Performance

### Test #9: Timeout N'Impacte Pas Performance
**Objectif:** Vérifier que les timeouts n'ajoutent pas de latence

```bash
time {
  # Upload 5 fichiers en parallèle
  for i in {1..5}; do
    curl -X POST n8n_webhook_url/upload &
  done
  wait
}
```
**Résultat attendu:** 
- ✅ Temps similaire à v1.0.1 (±5%)
- ✅ Pas de latence ajoutée par timeout

---

## ✅ Checklist de Validation Complète

Avant de marquer la version comme stable:

- [x] **Compilation:** TypeScript compile sans erreur
- [x] **Build:** npm pack réussit
- [x] **Installation:** Installation n8n OK
- [x] **Démarrage:** n8n démarre sans erreur
- [ ] **SSRF:** Test blocage localhost
- [ ] **SSRF:** Test blocage AWS metadata
- [ ] **SSRF:** Test blocage réseau privé
- [ ] **SSRF:** Test URL valide acceptée
- [ ] **Timeout:** Test timeout fichier
- [ ] **Timeout:** Test timeout API
- [ ] **Size:** Test fichier > 10MB rejeté
- [ ] **Size:** Test fichier < 10MB accepté
- [ ] **Error:** Vérifier pas de données sensibles
- [ ] **Polling:** Vérifier minimum 10s appliqué
- [ ] **Régression:** Upload base64 fonctionne
- [ ] **Régression:** Upload URL fonctionne
- [ ] **Régression:** Workflow complet fonctionne
- [ ] **Performance:** Pas de dégradation performance

---

## 🎯 Tests Prioritaires (À faire immédiatement)

### Test Rapide (5 minutes)
1. Créer workflow n8n avec node PhotoCertif
2. Tester upload URL valide (https://photocertif.com/test.pdf)
3. Tenter URL localhost → Doit être bloqué
4. Vérifier erreur ne contient pas de détails sensibles

### Test Complet (30 minutes)
1. Tous les tests SSRF (1.1 à 1.5)
2. Test timeout avec httpstat.us
3. Test workflow complet upload → certify → status
4. Vérifier logs n8n pour anomalies

---

## 📝 Rapport de Tests

**Date:** 2025-01-08  
**Version testée:** 1.0.2  
**Testeur:** [À compléter]

### Résultats
| Test | Statut | Notes |
|------|--------|-------|
| Compilation | ✅ PASS | Aucune erreur |
| Build | ✅ PASS | Package créé |
| Installation | ✅ PASS | n8n installé |
| Démarrage | ✅ PASS | n8n démarré |
| SSRF localhost | ⏳ TODO | |
| SSRF metadata | ⏳ TODO | |
| SSRF private IP | ⏳ TODO | |
| Timeout | ⏳ TODO | |
| File size | ⏳ TODO | |
| Error sanitize | ⏳ TODO | |
| Polling min | ⏳ TODO | |
| Upload base64 | ⏳ TODO | |
| Upload URL | ⏳ TODO | |
| Workflow complet | ⏳ TODO | |

### Recommandations
- [ ] Exécuter tests SSRF en priorité
- [ ] Documenter résultats dans ce fichier
- [ ] Si tous ✅ PASS → Marquer v1.0.2 comme stable
- [ ] Si ❌ FAIL → Créer issue GitHub et corriger

---

## 🔗 Liens Utiles

- [SECURITY_AUDIT_CRITICAL.md](./SECURITY_AUDIT_CRITICAL.md) - Détails vulnérabilités
- [CRITICAL_FIXES_CHECKLIST.md](./CRITICAL_FIXES_CHECKLIST.md) - Checklist corrections
- [CHANGELOG.md](./CHANGELOG.md) - Historique changements
