# 🎨 Exemples d'utilisation PhotoCertif

## Exemple 1: Certifier une photo depuis Google Drive

### Workflow: Photo Certification Flexible

**Node: Upload Photo**
```json
{
  "resourceType": "image",
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "https://drive.google.com/uc?id=1abc123&export=download",
  "title": "Sunset Beach Photo 2025",
  "description": "Beautiful sunset captured at Miami Beach"
}
```

**Résultat attendu:**
```json
{
  "success": true,
  "storage_id": "iv_1729012345678_xyz789",
  "title": "Sunset Beach Photo 2025",
  "hash": "abc123..."
}
```

---

## Exemple 2: Certifier une œuvre d'art NFT

### Workflow: Art Certification

**Node: Upload Art Image**
```json
{
  "resourceType": "image2",
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "https://cdn.example.com/artworks/abstract-001.png",
  "title": "Abstract Dreams #001",
  "description": "Digital abstract art piece from 2025 collection"
}
```

**Node: B2B Complete Certification**
```json
{
  "resourceType": "image2",
  "operation": "b2bCertifyFull",
  "storageId": "={{ $json.storage_id }}",
  "fingerprintName": "abstract_dreams_001_fingerprint",
  "walletPrivateKey": "={{ $env.SOLANA_WALLET_PRIVATE_KEY }}",
  "recipientWallet": "GbjYY8iY4zKT154ivm2sz5FJAde7AMiRVt4SbPHFA7Zs"
}
```

**Résultat attendu:**
```json
{
  "success": true,
  "nft_address": "D7GLLiWaPB1ouMNcgLLQ1eaA3sM48gJ4QQKo33LEgM1X",
  "irys_url": "https://gateway.irys.xyz/abc123...",
  "irys_url_metadata": "https://gateway.irys.xyz/def456...",
  "transaction_signature": "5j3k2l1m..."
}
```

---

## Exemple 3: Intégration avec webhook

### Scenario: Recevoir une image via webhook, certifier, renvoyer le résultat

```
Webhook Trigger → Upload Photo → Submit Certification → Wait → Response
```

**Node: Webhook Trigger**
```json
{
  "httpMethod": "POST",
  "path": "photocertif-upload",
  "responseMode": "lastNode"
}
```

**Payload reçu:**
```json
{
  "imageUrl": "https://client-server.com/images/photo123.jpg",
  "title": "Client Photo",
  "owner": "John Doe"
}
```

**Node: Upload Photo (utiliser payload)**
```json
{
  "resourceType": "image",
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "={{ $json.body.imageUrl }}",
  "title": "={{ $json.body.title }}",
  "description": "Photo submitted by {{ $json.body.owner }}"
}
```

**Response finale:**
```json
{
  "status": "success",
  "storage_id": "iv_...",
  "pinata_url": "https://gateway.pinata.cloud/ipfs/Qm...",
  "certificate_url": "https://app2.photocertif.com/certificate/..."
}
```

---

## Exemple 4: Batch certification (plusieurs images)

### Workflow avec loop

```
Manual Trigger → Code (liste URLs) → Split In Batches → Upload → Certify → Merge
```

**Node: Code (préparer liste)**
```javascript
return [
  {
    json: {
      images: [
        {url: "https://example.com/img1.jpg", title: "Photo 1"},
        {url: "https://example.com/img2.jpg", title: "Photo 2"},
        {url: "https://example.com/img3.jpg", title: "Photo 3"}
      ]
    }
  }
];
```

**Node: Split In Batches**
```json
{
  "batchSize": 1,
  "options": {}
}
```

**Node: Upload Photo**
```json
{
  "resourceType": "image",
  "operation": "upload",
  "inputType": "url",
  "fileUrl": "={{ $json.url }}",
  "title": "={{ $json.title }}",
  "description": "Batch certification"
}
```

---

## Exemple 5: Vérifier le pricing avant certification

```
Manual Trigger → Get Pricing → IF (enough balance) → Upload → Certify
```

**Node: Get Pricing**
```json
{
  "operation": "getPricing",
  "service": "image2"
}
```

**Résultat:**
```json
{
  "service": "image2",
  "price_usd": 15.00,
  "price_checkhc": 150.00,
  "sol_price": 0.05,
  "exchange_rate_sol_usd": 180.50
}
```

**Node: IF**
```
{{ $json.price_checkhc }} <= 200
```
Si true → Continue vers Upload
Si false → Stop ou Send notification

---

## Exemple 6: Notification Discord après certification

```
Upload → Certify → Wait → Download → HTTP Request (Discord Webhook)
```

**Node: HTTP Request (Discord)**
```json
{
  "method": "POST",
  "url": "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/TOKEN",
  "jsonParameters": true,
  "options": {},
  "body": {
    "content": "✅ Nouvelle certification terminée!",
    "embeds": [
      {
        "title": "{{ $('Upload Photo').item.json.title }}",
        "description": "Storage ID: {{ $('Upload Photo').item.json.storage_id }}",
        "color": 5814783,
        "fields": [
          {
            "name": "Status",
            "value": "{{ $json.status }}",
            "inline": true
          },
          {
            "name": "Pinata URL",
            "value": "{{ $json.pinata_url }}",
            "inline": false
          }
        ],
        "footer": {
          "text": "PhotoCertif by CHECKHC"
        }
      }
    ]
  }
}
```

---

## Exemple 7: Stocker résultats dans Google Sheets

```
Upload → Certify → Wait → Google Sheets (append row)
```

**Node: Google Sheets**
```json
{
  "operation": "append",
  "sheetName": "Certifications",
  "values": {
    "Date": "={{ $now.toISO() }}",
    "Storage ID": "={{ $('Upload Photo').item.json.storage_id }}",
    "Title": "={{ $('Upload Photo').item.json.title }}",
    "Status": "={{ $json.status }}",
    "Pinata URL": "={{ $json.pinata_url }}"
  }
}
```

---

## 🔐 Sécurité: Gestion des clés privées

### Méthode 1: Variables d'environnement n8n

```bash
# Dans docker-compose.yml ou .env
N8N_ENV_VARIABLES='{
  "SOLANA_WALLET_PRIVATE_KEY": "your_base58_key",
  "RECIPIENT_WALLET_ADDRESS": "GbjYY8iY4zKT154ivm2sz5FJAde7AMiRVt4SbPHFA7Zs"
}'
```

**Utilisation dans workflow:**
```json
{
  "walletPrivateKey": "={{ $env.SOLANA_WALLET_PRIVATE_KEY }}",
  "recipientWallet": "={{ $env.RECIPIENT_WALLET_ADDRESS }}"
}
```

### Méthode 2: Credentials n8n

Utiliser le credential "Solana API" qui masque automatiquement les clés privées.

---

## ⚠️ Erreurs courantes et solutions

### Erreur: "Insufficient balance"

**Cause:** Pas assez de tokens CHECKHC dans le wallet

**Solution:**
1. Vérifier le balance: `Get Pricing` → voir `price_checkhc`
2. Acheter tokens CHECKHC sur DEX Solana
3. Ou utiliser mode manuel (sans B2B Complete)

### Erreur: "Storage not found"

**Cause:** storage_id invalide ou expiré

**Solution:**
1. Vérifier que l'upload a réussi
2. Utiliser `={{ $json.storage_id }}` pour récupérer l'ID
3. Ne pas modifier manuellement l'ID

### Erreur: "Invalid URL"

**Cause:** URL non accessible ou privée

**Solution:**
1. Vérifier que l'URL est publique
2. Pour Google Drive: utiliser format `https://drive.google.com/uc?id=FILE_ID&export=download`
3. Ou utiliser `inputType: "base64"` à la place

---

## 📚 Ressources

- Documentation API: https://app2.photocertif.com/docs
- Support Discord: https://discord.gg/v6pcMSSz6b
- Twitter: https://x.com/checkhc_X
- Website: https://www.checkhc.net
