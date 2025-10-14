# 📚 Workflows PhotoCertif pour n8n

## 🎯 2 Workflows disponibles

### 🔵 Photo Certification Flexible (Pinata IPFS)
**Fichier:** `workflow-photo-certification-image.json`

**Flux:**
```
Manual Trigger → Upload Photo → Submit Certification → Wait → Get Status → Download
```

**Configuration:**
- resourceType: `image`
- Stockage: Pinata IPFS (automatique côté serveur)
- Idéal pour: Photos standard, certifications rapides

**Paramètres à modifier:**
1. Upload Photo:
   - fileUrl: URL de votre image
   - title: Titre de la photo
   - description: Description

2. Submit Certification:
   - certificationSymbol: "PHOTO" (ou autre)
   - ownerName: Votre nom

---

### 🟣 Art Certification (Irys/Arweave)
**Fichier:** `workflow-art-certification-image2.json`

**Flux:**
```
Manual Trigger → Upload Art → Submit Certification → Wait → B2B Complete → Download
```

**Configuration:**
- resourceType: `image2`
- Stockage: Irys/Arweave (permanent)
- Idéal pour: Œuvres d'art, NFTs premium

**Paramètres à modifier:**
1. Upload Art Image:
   - fileUrl: URL de votre artwork
   - title: Titre de l'œuvre
   - description: Description artistique

2. Submit Art Certification:
   - certificationSymbol: "ART" (ou autre)
   - ownerName: Nom de l'artiste

3. B2B Complete Certification:
   - fingerprintName: Nom unique pour l'empreinte
   - walletPrivateKey: ={{ $env.SOLANA_WALLET_PRIVATE_KEY }}
   - recipientWallet: ={{ $env.RECIPIENT_WALLET_ADDRESS }}

**⚠️ IMPORTANT:** B2B Complete nécessite:
- Credential Solana API configuré
- Variables d'environnement pour les clés privées
- Tokens CHECKHC dans le wallet

---

## 🚀 Installation

### 1. Importer dans n8n

**Option A - Via interface:**
```
n8n → Workflows → Import from File → Sélectionner JSON → Import
```

**Option B - Via fichier:**
```bash
cp workflow-*.json ~/.n8n/workflows/
```

### 2. Configurer Credentials

#### PhotoCertif API (obligatoire)
```
PhotoCertif URL: https://app2.photocertif.com
API Key: (générer dans My Account → API Keys)
Pinata API Key: (optionnel)
Pinata Secret Key: (optionnel)
```

**Générer API Key:**
1. Aller sur https://app2.photocertif.com
2. My Account → API Keys
3. Create New Key
4. Sélectionner scopes: `docs:read`, `docs:upload`, `docs:write`
5. Copier la clé

#### Solana API (pour Art Certification B2B)
```
Network: mainnet-beta
RPC Type: custom
Custom RPC URL: https://your-helius-or-quicknode-rpc
Private Key: Votre clé privée Solana (array de 64 bytes)
Public Key: Adresse publique de votre wallet
```

### 3. Variables d'environnement (pour Art B2B)

Dans n8n, définir:
```bash
SOLANA_WALLET_PRIVATE_KEY=your_base58_private_key
RECIPIENT_WALLET_ADDRESS=wallet_address_to_receive_nft
```

---

## 📊 Comparaison des flux

| Critère | Photo (image) | Art (image2) |
|---------|---------------|--------------|
| Stockage | Pinata IPFS | Irys/Arweave |
| Type | Distribué | Permanent |
| Upload | Serveur | B2B automatique |
| Coût | Standard | Premium |
| Analyse IA | Basique | Avancée (4 niveaux) |
| B2B Auto | ❌ Non | ✅ Oui |
| NFT Auto | ❌ Manuel | ✅ Automatique |

---

## 🔄 Utilisation

### Photo Certification (Pinata)

**Cas d'usage:** Certifier rapidement des photos

1. **Trigger** le workflow manuellement
2. **Upload Photo** → Fournit storage_id
3. **Submit Certification** → Lance le processus
4. **Wait** → Polling jusqu'à COMPLETED (max 5min)
5. **Get Status** → Vérifie URLs Pinata
6. **Download** → Récupère certificat PDF

**Résultat:**
- Certificat PDF
- URLs IPFS Pinata
- Metadata JSON

### Art Certification (Irys/Arweave)

**Cas d'usage:** Certifier des œuvres d'art avec NFT automatique

1. **Trigger** le workflow manuellement
2. **Upload Art** → Fournit storage_id
3. **Submit Certification** → Lance analyse IA avancée
4. **Wait** → Polling jusqu'à COMPLETED (max 5min)
5. **B2B Complete** → 
   - Paie en CHECKHC tokens
   - Upload vers Arweave
   - Crée NFT Solana
6. **Download** → Récupère tout

**Résultat:**
- Certificat PDF
- URLs Arweave permanentes
- NFT Solana créé
- Transaction signature

---

## 🛠️ Personnalisation

### Modifier le polling

Dans "Wait for Certification":
```json
{
  "maxWaitTime": 600,        // 10 minutes au lieu de 5
  "pollingInterval": 10      // Vérifier toutes les 10s
}
