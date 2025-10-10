# 🧪 Plan de Tests Complet - v1.1.0

## ⚠️ CRITICAL: Tests Requis Avant Publication npm

Ce document liste TOUS les tests à effectuer avant de publier `n8n-nodes-photocertif@1.1.0` sur npm.

---

## 📋 Checklist Globale

- [ ] **Phase 1**: Tests Locaux (Installation & Build)
- [ ] **Phase 2**: Tests Credentials
- [ ] **Phase 3**: Tests Opérations Individuelles
- [ ] **Phase 4**: Tests Workflow Complet
- [ ] **Phase 5**: Tests Régression
- [ ] **Phase 6**: Tests Documentation
- [ ] **Phase 7**: Tests Compatibilité
- [ ] **Phase 8**: Validation Finale

---

## 🔧 Phase 1: Tests Locaux (Installation & Build)

### Test 1.1: Installation Clean
```bash
# Environnement propre
mkdir /tmp/test-photocertif
cd /tmp/test-photocertif
npm init -y

# Installer les 2 packages
npm install n8n-nodes-solana-swap
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.1.0.tgz

# Vérifier installation
ls node_modules/n8n-nodes-solana-swap
ls node_modules/n8n-nodes-photocertif
```

**Résultat attendu:**
- ✅ Les 2 packages installés sans erreur
- ✅ Pas de warnings peerDependencies
- ✅ node_modules correct

---

### Test 1.2: Vérification Structure Package
```bash
cd node_modules/n8n-nodes-photocertif

# Vérifier fichiers
ls dist/credentials/  # Doit contenir UNIQUEMENT PhotoCertifApi.credentials.js
ls dist/nodes/PhotoCertif/

# Vérifier qu'il n'y a PAS de SolanaWallet
grep -r "SolanaWallet" . 2>/dev/null
# ↑ Doit retourner RIEN (ou juste dans CHANGELOG/README comme référence historique)
```

**Résultat attendu:**
- ✅ `SolanaWallet.credentials.js` ABSENT
- ✅ Seulement `PhotoCertifApi.credentials.js` présent
- ✅ Package.json contient peerDependencies

---

### Test 1.3: Dépendances
```bash
cd /tmp/test-photocertif

# Vérifier que les dépendances Solana NE SONT PAS dupliquées
npm list @solana/web3.js
npm list bs58

# Résultat attendu: 
# @solana/web3.js devrait apparaître UNIQUEMENT sous n8n-nodes-solana-swap
# PAS sous n8n-nodes-photocertif
```

**Résultat attendu:**
- ✅ `@solana/web3.js` uniquement dans solana-swap
- ✅ `bs58` uniquement dans solana-swap
- ✅ Pas de duplication

---

## 🔑 Phase 2: Tests Credentials

### Test 2.1: Installation dans n8n
```bash
# Copier dans n8n
cd ~/.n8n
npm install n8n-nodes-solana-swap
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.1.0.tgz

# Redémarrer n8n
pkill -f "node.*n8n"
n8n start
```

**Résultat attendu:**
- ✅ n8n démarre sans erreur
- ✅ Les 2 nodes apparaissent dans la liste

---

### Test 2.2: Credential PhotoCertif API
```
1. Ouvrir n8n UI → Credentials → New Credential
2. Rechercher "PhotoCertif API"
3. Vérifier champs:
   - PhotoCertif URL: string
   - API Key: password field
4. Remplir avec vraies credentials
5. Cliquer "Test"
```

**Résultat attendu:**
- ✅ Credential trouvée
- ✅ Formulaire correct
- ✅ Test de connexion réussit

---

### Test 2.3: Credential Solana API
```
1. Ouvrir n8n UI → Credentials → New Credential
2. Rechercher "Solana API"
3. Vérifier champs:
   - Network: options (mainnet-beta, devnet, testnet)
   - RPC Endpoint Type: options (public, custom)
   - Custom RPC URL: string (si custom)
   - Private Key: password
   - Public Key: string
4. Remplir avec vraies credentials
5. Cliquer "Test"
```

**Résultat attendu:**
- ✅ Credential "Solana API" existe (de solana-swap)
- ✅ Formulaire complet
- ✅ Test de connexion Solana réussit

---

### Test 2.4: Node PhotoCertif Détecte Credentials
```
1. Créer nouveau workflow
2. Ajouter node "PhotoCertif"
3. Vérifier dropdown credentials:
   - PhotoCertif API (required)
   - Solana API (optional)
4. Assigner les credentials créées
```

**Résultat attendu:**
- ✅ PhotoCertif API visible et required
- ✅ Solana API visible et optional
- ✅ PAS de "SolanaWallet" dans la liste

---

## 🔨 Phase 3: Tests Opérations Individuelles

### Test 3.1: Upload (Base64)
```yaml
Node: PhotoCertif
Operation: upload
Parameters:
  - Resource Type: docs
  - Input Type: base64
  - File Data: data:application/pdf;base64,JVBERi0xLjcK...
  - Title: "Test Upload v1.1.0"
  - Description: "Test base64"
Credentials: PhotoCertif API
```

**Résultat attendu:**
- ✅ Upload réussit
- ✅ Retourne: storageId, price_checkhc, checkhc_mint, payment_wallet
- ✅ Pas d'erreur console

---

### Test 3.2: Upload (URL)
```yaml
Node: PhotoCertif
Operation: upload
Parameters:
  - Resource Type: docs
  - Input Type: url
  - File URL: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
  - Title: "Test Upload URL v1.1.0"
  - Description: "Test URL"
Credentials: PhotoCertif API
```

**Résultat attendu:**
- ✅ Upload depuis URL réussit
- ✅ Sécurité SSRF active (teste avec http://localhost doit échouer)
- ✅ Timeout fonctionne

---

### Test 3.3: Get Pricing
```yaml
Node: PhotoCertif
Operation: getPricing
Parameters:
  - Resource Type: docs
Credentials: PhotoCertif API
```

**Résultat attendu:**
- ✅ Retourne prix en CHECKHC
- ✅ Retourne prix en USD
- ✅ Retourne checkhc_mint address
- ✅ Retourne payment_wallet

---

### Test 3.4: Get Status
```yaml
Node: PhotoCertif
Operation: getStatus
Parameters:
  - Resource Type: docs
  - Storage ID: {{ output de upload }}
Credentials: PhotoCertif API
```

**Résultat attendu:**
- ✅ Retourne status: "uploaded"
- ✅ Retourne metadata du fichier

---

## 🔗 Phase 4: Tests Workflow Complet (Intégration SolanaNode)

### Test 4.1: Workflow Complet avec Token Transfer

**Architecture:**
```
[1] PhotoCertif: Upload
     ↓
[2] SolanaNode: Get Token Balance
     ↓
[3] IF Node: balance >= price?
     ↓ YES
[4] SolanaNode: Send Token
     ↓
[5] PhotoCertif: Certify
     ↓
[6] PhotoCertif: Wait For Certification
```

**Configuration:**

**Node 1: PhotoCertif Upload**
```yaml
Operation: upload
Resource Type: docs
Input Type: base64
File Data: (test PDF)
Title: "Integration Test v1.1.0"
Credentials: PhotoCertif API
```

**Node 2: SolanaNode Get Token Balance**
```yaml
Operation: getTokenBalance
Token Mint: {{ $node["PhotoCertif"].json.checkhc_mint }}
Wallet Address: (laisser vide = wallet credentials)
Credentials: Solana API
```

**Node 3: IF Node**
```yaml
Condition: {{ $node["SolanaNode"].json.balance >= $node["PhotoCertif"].json.price_checkhc }}
```

**Node 4: SolanaNode Send Token**
```yaml
Operation: sendToken
Token Mint: {{ $node["PhotoCertif"].json.checkhc_mint }}
Recipient: {{ $node["PhotoCertif"].json.payment_wallet }}
Amount: {{ $node["PhotoCertif"].json.price_checkhc }}
Credentials: Solana API
```

**Node 5: PhotoCertif Certify**
```yaml
Operation: certify
Resource Type: docs
Storage ID: {{ $node["PhotoCertif"].json.storageId }}
Name: "Test Certificate"
Symbol: "TEST"
Description: "Integration test"
Credentials: PhotoCertif API
```

**Node 6: PhotoCertif Wait**
```yaml
Operation: waitForCertification
Resource Type: docs
Storage ID: {{ $node["PhotoCertif Certify"].json.storageId }}
Polling Interval: 60
Max Wait Time: 600
Credentials: PhotoCertif API
```

**Résultat attendu:**
- ✅ Upload → storageId
- ✅ Get Balance → balance CHECKHC
- ✅ IF condition évaluée correctement
- ✅ Send Token → signature transaction
- ✅ Certify → certification lancée
- ✅ Wait → status "certified" + nft_mint
- ✅ Workflow complet sans erreur

---

### Test 4.2: Test avec Swap (Si balance insuffisante)

**Ajouter avant Send Token:**
```yaml
[3b] SolanaNode: Execute Swap
Operation: executeSwapAdvanced
From Token: SOL
To Token: CHECKHC
Amount: {{ $node["PhotoCertif"].json.price_checkhc }}
Credentials: Solana API
```

**Résultat attendu:**
- ✅ Swap SOL → CHECKHC réussit
- ✅ Balance CHECKHC augmente
- ✅ Peut ensuite transférer vers PhotoCertif

---

## 🔄 Phase 5: Tests Régression (Vérifier que rien n'est cassé)

### Test 5.1: Toutes les Opérations PhotoCertif
```
- [ ] Upload base64
- [ ] Upload URL
- [ ] Get Status
- [ ] Certify
- [ ] Wait For Certification
- [ ] Download
- [ ] Get Pricing
```

**Résultat attendu:**
- ✅ Toutes les opérations fonctionnent comme en v1.0.2
- ✅ Aucune régression

---

### Test 5.2: Test avec Resource Type = image2
```yaml
Operation: upload
Resource Type: image2
Input Type: url
File URL: (URL image valide)
```

**Résultat attendu:**
- ✅ Upload image2 fonctionne
- ✅ AI analysis score retourné

---

### Test 5.3: Erreurs Gérées Correctement
```
Test volontaires d'erreurs:
- [ ] URL invalide (SSRF)
- [ ] API key incorrecte
- [ ] Storage ID inexistant
- [ ] Timeout sur URL lente
- [ ] Fichier > 10MB
```

**Résultat attendu:**
- ✅ Messages d'erreur clairs
- ✅ Pas de crash n8n
- ✅ Erreurs sanitisées (pas de leak données sensibles)

---

## 📚 Phase 6: Tests Documentation

### Test 6.1: README Instructions
```
Suivre le README.md étape par étape comme un nouvel utilisateur:
- [ ] Installation via npm
- [ ] Configuration credentials
- [ ] Workflow exemple
```

**Résultat attendu:**
- ✅ Instructions claires et complètes
- ✅ Workflow exemple fonctionne tel quel
- ✅ Aucune étape manquante

---

### Test 6.2: CHANGELOG Précision
```
Vérifier que CHANGELOG.md:
- [ ] Breaking change documenté clairement
- [ ] Migration guide complet
- [ ] Bénéfices listés
```

**Résultat attendu:**
- ✅ Utilisateur comprend ce qui change
- ✅ Sait comment migrer
- ✅ Comprend pourquoi upgrader

---

## 🌐 Phase 7: Tests Compatibilité

### Test 7.1: Versions n8n
```bash
# Tester avec différentes versions n8n
n8n --version

# Minimum supporté: 0.200.0
# Tester avec version actuelle
```

**Résultat attendu:**
- ✅ Fonctionne avec n8n >= 0.200.0

---

### Test 7.2: Node.js Versions
```bash
node --version

# Tester avec:
# - Node 18.x (minimum)
# - Node 20.x (recommandé)
# - Node 22.x (latest)
```

**Résultat attendu:**
- ✅ Fonctionne avec Node >= 18

---

## ✅ Phase 8: Validation Finale

### Test 8.1: Installation Utilisateur Final
```bash
# Simuler installation utilisateur
rm -rf ~/.n8n/node_modules/n8n-nodes-*

# Installer depuis packages locaux (simuler npm)
cd ~/.n8n
npm install n8n-nodes-solana-swap@1.5.0
npm install /home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.1.0.tgz

# Redémarrer et tester workflow complet
```

**Résultat attendu:**
- ✅ Installation simple
- ✅ Workflow fonctionne immédiatement
- ✅ Pas de configuration complexe

---

### Test 8.2: Vérification Package Size
```bash
ls -lh n8n-nodes-photocertif-1.1.0.tgz

# Comparer avec v1.0.2
# v1.0.2: 188.6 kB
# v1.1.0: ~189 kB (doit être similaire ou plus petit)
```

**Résultat attendu:**
- ✅ Taille package raisonnable
- ✅ Pas d'augmentation massive

---

### Test 8.3: Performance Workflow
```bash
# Mesurer temps d'exécution workflow complet
time {
  # Exécuter workflow complet
}

# Comparer avec v1.0.2
```

**Résultat attendu:**
- ✅ Performance similaire ou meilleure
- ✅ Pas de régression performance

---

## 🎯 Critères de Validation Publication

**TOUS les tests doivent passer avant publication npm:**

### Critères Bloquants (MUST PASS):
- [x] Compilation: yarn build ✅
- [x] Package: npm pack ✅
- [ ] Installation clean sans erreur
- [ ] Credentials PhotoCertif API fonctionne
- [ ] Credentials Solana API détectée
- [ ] Upload opération fonctionne
- [ ] Workflow complet PhotoCertif + SolanaNode fonctionne
- [ ] Aucune régression vs v1.0.2
- [ ] Documentation README claire

### Critères Recommandés (SHOULD PASS):
- [ ] Tous les types de ressources testés (docs, image2)
- [ ] Erreurs gérées proprement
- [ ] Performance acceptable
- [ ] Compatibilité versions vérifiée

### Critères Optionnels (NICE TO HAVE):
- [ ] Tests automatisés en place
- [ ] CI/CD pipeline configuré
- [ ] Badges npm dans README

---

## 📝 Rapport de Tests

### Template Rapport:
```markdown
# Test Report - n8n-nodes-photocertif v1.1.0

**Date:** YYYY-MM-DD
**Testeur:** [Nom]
**Environnement:**
- n8n version: X.X.X
- Node.js version: X.X.X
- OS: Linux/Mac/Windows

## Phase 1: Installation
- [ ] Test 1.1: ✅/❌ + notes
- [ ] Test 1.2: ✅/❌ + notes
- [ ] Test 1.3: ✅/❌ + notes

## Phase 2: Credentials
...

## Bugs Trouvés:
1. [Description bug]
   - Sévérité: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected:
   - Actual:

## Recommandations:
- [ ] Fix bug #1 avant publication
- [ ] Update docs section X

## Conclusion:
- ✅ READY FOR PUBLICATION
- ❌ NEEDS FIXES (list critical issues)
```

---

## 🔗 Ressources

- Package local: `/home/greg/n8n-nodes-photocertif/n8n-nodes-photocertif-1.1.0.tgz`
- README: `/home/greg/n8n-nodes-photocertif/README.md`
- CHANGELOG: `/home/greg/n8n-nodes-photocertif/CHANGELOG.md`
- Solana-swap npm: `https://www.npmjs.com/package/n8n-nodes-solana-swap`

---

## 🚀 Après Tests OK

Une fois TOUS les tests passés:

```bash
cd /home/greg/n8n-nodes-photocertif

# Vérifier version
cat package.json | grep version

# Publier sur npm (avec compte checkhc)
npm login
npm publish

# Créer tag Git
git tag v1.1.0
git push origin v1.1.0

# Créer GitHub Release
# → Joindre CHANGELOG
# → Joindre n8n-nodes-photocertif-1.1.0.tgz
```

---

**NOTE:** Ne pas hésiter à ajouter des tests supplémentaires si des cas spécifiques sont identifiés pendant les tests !
