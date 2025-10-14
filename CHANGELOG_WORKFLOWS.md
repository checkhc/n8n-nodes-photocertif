# 📝 Changelog des Workflows PhotoCertif

## 🆕 Version Actuelle (Oct 14, 2025)

### Nouveaux workflows

✅ **workflow-photo-certification-image.json**
- Photo Certification Flexible utilisant Pinata IPFS
- resourceType: `image`
- 5 nodes: Upload → Certify → Wait → Get Status → Download

✅ **workflow-art-certification-image2.json**
- Art Certification utilisant Irys/Arweave permanent
- resourceType: `image2`
- 5 nodes: Upload → Certify → Wait → B2B Complete → Download
- Inclut paiement automatique + création NFT

### Nouveaux docs

✅ **README_WORKFLOWS.md** - Guide d'installation et configuration
✅ **EXAMPLES.md** - 7 exemples d'utilisation pratiques

---

## 🗑️ Workflows archivés (Oct 14, 2025)

Les workflows suivants ont été déplacés dans `old_workflows_backup/`:

### Documents certification (obsolète)
- ❌ workflow-docs-certification-v1.1.0.json
- ❌ workflow-docs-certification-v2.0.0.json
- ❌ workflow-docs-certification-v2.1.0.json
- ❌ workflow-docs-certification-v2.2.0.json

**Raison:** Remplacés par le node DigiCryptoStore dédié

### Image2 certification (obsolète)
- ❌ workflow-image2-certification-v1.1.0.json

**Raison:** Remplacé par workflow-art-certification-image2.json

---

## 🔄 Migration

### De workflow-docs-certification vers DigiCryptoStore

**Avant:**
```json
{
  "node": "PhotoCertif",
  "resourceType": "docs",
  "operation": "upload"
}
```

**Après:**
```json
{
  "node": "DigiCryptoStore",
  "resourceType": "docs",
  "operation": "upload"
}
```

### De workflow-image2-certification-v1.1.0 vers workflow-art-certification-image2

**Changements:**
- ✅ Ajout du node "B2B Complete Certification" (automatise paiement + NFT)
- ✅ Meilleure gestion des erreurs
- ✅ Paramètres plus clairs
- ✅ Documentation intégrée

**Migration:**
1. Importer le nouveau workflow
2. Configurer les credentials (identiques)
3. Tester avec une image de test
4. Supprimer l'ancien workflow

---

## 📊 Comparaison versions

| Critère | Anciens workflows | Nouveaux workflows |
|---------|-------------------|-------------------|
| **Structure** | Complexe, multi-versions | Simplifié, 2 workflows clairs |
| **Documentation** | Limitée | Complète (README + EXAMPLES) |
| **B2B Auto** | ❌ Non | ✅ Oui (Art Certification) |
| **Maintenance** | Multiple versions | Version unique par type |
| **Clarté** | Noms versionnés confus | Noms descriptifs |

---

## 📅 Historique

- **Oct 14, 2025** - Création des nouveaux workflows + archivage anciens
- **Oct 12, 2025** - workflow-docs-certification-v2.2.0 (dernière version docs)
- **Oct 12, 2025** - workflow-docs-certification-v2.1.0
- **Oct 12, 2025** - workflow-docs-certification-v2.0.0
- **Oct 10, 2025** - workflow-docs-certification-v1.1.0
- **Oct 10, 2025** - workflow-image2-certification-v1.1.0
