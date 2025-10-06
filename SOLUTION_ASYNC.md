# 🔄 Solution n8n Asynchrone - Certification Complète

## 🎯 Le Problème Réel

L'API PhotoCertif **prépare** la certification mais ne peut pas :
- Payer les frais CHECKHC automatiquement
- Minter le NFT sans wallet user

**MAIS** n8n peut faire des workflows asynchrones !

---

## ✅ Solution 1 : Workflow avec Polling (Recommandé)

### **Étape 1: Soumettre la Certification**
```
Manual Trigger / Schedule
  ↓
PhotoCertif Node - Upload Document
  - Operation: Upload
  - File: {{$json.file}}
  - Title: "Contract 2025"
  ↓
PhotoCertif Node - Submit Certification Form
  - Operation: Certify
  - Storage ID: {{$json.storage_id}}
  - Name: "Contract2025"
  - Symbol: "CNTR"
  - Description: "Legal contract"
  - Owner: "Company ABC"
  ↓
Set Variable
  - storage_id: {{$json.storage_id}}
  - status: "pending"
```

### **Étape 2: Notification à l'Utilisateur**
```
Send Email / Slack / Notification
  - Subject: "⏳ Certification Ready for Payment"
  - Body: "Please visit: https://app2.photocertif.com/media/docs/certification?iv_storageid={{$json.storage_id}}"
  - Link: "Click to complete payment and mint NFT"
```

### **Étape 3: Polling + Attente (Loop)**
```
Wait Node (5 minutes)
  ↓
PhotoCertif Node - Get Status
  - Operation: Get Status
  - Storage ID: {{$node["Variables"].json["storage_id"]}}
  ↓
IF Node: status === "certified" ?
  ├─ YES → Continue to next step
  └─ NO → Loop back to Wait Node (max 24 hours)
```

### **Étape 4: Actions Post-Certification**
```
IF: Certified
  ↓
Send Email / Webhook
  - Subject: "✅ NFT Minted Successfully!"
  - NFT Address: {{$json.nft_address}}
  - Certificate URL: {{$json.certification_url}}
  ↓
Update Database / CRM
  - Store NFT address
  - Update document status
  ↓
Generate Report
  - PDF certificate
  - Send to stakeholders
```

---

## ✅ Solution 2 : Webhook Callback (Optimal)

### **Modification PhotoCertif (Future)**

Ajouter un champ `callback_url` dans l'API certify :

```typescript
POST /api/storage/docs/certify/iv_route
{
  "id": "iv_xxxxx",
  "name": "Contract2025",
  // ... autres champs
  "callback_url": "https://n8n.example.com/webhook/certification-complete"
}
```

Quand le NFT est minté (par l'utilisateur ou automatiquement), PhotoCertif appelle :

```typescript
POST https://n8n.example.com/webhook/certification-complete
{
  "storage_id": "iv_xxxxx",
  "status": "certified",
  "nft_address": "ABC123...",
  "certification_date": "2025-01-06T21:00:00Z"
}
```

### **Workflow n8n avec Webhook**

```
Part 1: Submit Certification
─────────────────────────────
Manual Trigger
  ↓
PhotoCertif - Upload
  ↓
PhotoCertif - Certify
  - callback_url: {{webhook_url}}
  ↓
Send Notification
  - "Certification submitted, awaiting payment"
  ↓
Wait for Webhook...


Part 2: Webhook Receiver (New Workflow)
────────────────────────────────────────
Webhook Trigger: /webhook/certification-complete
  ↓
Extract Data
  - storage_id
  - nft_address
  - certification_date
  ↓
PhotoCertif - Get Status (verify)
  ↓
Send Success Notification
  ↓
Update Records
  ↓
Generate Certificate PDF
  ↓
Archive to Storage
```

---

## ✅ Solution 3 : Hybrid avec Wallet Délégué

### **PhotoCertif avec Wallet Système**

PhotoCertif a un wallet interne qui :
1. Paye les frais pour l'utilisateur
2. Mint le NFT
3. Débite le compte CHECKHC de l'utilisateur en interne
4. Transfère le NFT vers `user.walletAddress`

**Avantages :**
- ✅ Vraiment automatisé
- ✅ Pas de private key en transit
- ✅ User paye depuis son compte PhotoCertif
- ✅ n8n workflow synchrone possible

**Workflow n8n (Simplifié) :**
```
Upload
  ↓
Certify (with wallet delegation)
  ↓
Wait 30 seconds
  ↓
Get Status (should be "certified")
  ↓
Done! NFT minted automatically
```

---

## 📊 Comparaison des Solutions

| Solution | Complexité | Automatisation | Sécurité | Modifications PhotoCertif |
|----------|------------|----------------|----------|---------------------------|
| **Polling** | Moyenne | Partielle (user paye) | ✅ Haute | ❌ Aucune |
| **Webhook** | Haute | Partielle (user paye) | ✅ Haute | ⚠️ Ajouter callback |
| **Wallet Délégué** | Faible | ✅ Complète | ✅ Haute | ⚠️ Wallet système |

---

## 🎯 Exemple Complet : Polling Workflow

### **Workflow n8n Complet**

```yaml
Name: "PhotoCertif Automated Certification with Monitoring"

Nodes:
  1. Manual Trigger
     - Click to start
  
  2. Set Document Data
     - file: "{{$json.base64_content}}"
     - title: "Contract 2025"
     - description: "Legal partnership agreement"
  
  3. PhotoCertif - Upload Document
     - Operation: Upload
     - Resource: docs
     - File: {{$node["Set Document Data"].json["file"]}}
     - Title: {{$node["Set Document Data"].json["title"]}}
     - Description: {{$node["Set Document Data"].json["description"]}}
  
  4. Set Variables
     - storage_id: {{$json.storage_id}}
     - start_time: {{$now}}
     - max_wait_hours: 24
  
  5. PhotoCertif - Submit Certification
     - Operation: Certify
     - Resource: docs
     - Storage ID: {{$node["Variables"].json["storage_id"]}}
     - Name: "Contract2025"
     - Symbol: "CNTR"
     - Description: "Legal partnership agreement"
     - Owner: "Company ABC Inc"
     - Collection: "{{$node["Get Collection"].json["mint_address"]}}"
     - External URL: "https://company-abc.com"
  
  6. Send Notification - Pending
     - Type: Email
     - To: "user@example.com"
     - Subject: "⏳ Certification Ready for Payment"
     - Body: |
         Your document has been prepared for certification.
         
         Please complete payment and mint NFT:
         https://app2.photocertif.com/media/docs/certification?iv_storageid={{$node["Variables"].json["storage_id"]}}
         
         We will notify you when complete.
  
  7. Wait - Initial Delay
     - Duration: 5 minutes
  
  8. Loop Start (Label)
  
  9. PhotoCertif - Check Status
     - Operation: Get Status
     - Resource: docs
     - Storage ID: {{$node["Variables"].json["storage_id"]}}
  
  10. IF - Is Certified?
      - Condition: {{$json.status}} === "certified"
      - TRUE → Go to Success Branch
      - FALSE → Go to Wait Branch
  
  11. Wait Branch:
      11a. Check Timeout
           - elapsed_hours: {{($now - $node["Variables"].json["start_time"]) / 3600000}}
           - IF elapsed_hours > max_wait_hours
             → Send Timeout Email
             → Stop
      
      11b. Wait - Polling Interval
           - Duration: 10 minutes
      
      11c. Go back to Node 9 (Loop)
  
  12. Success Branch:
      12a. PhotoCertif - Get Final Status
           - Operation: Get Status
           - Storage ID: {{$node["Variables"].json["storage_id"]}}
      
      12b. Extract NFT Data
           - nft_address: {{$json.nft_address}}
           - certification_date: {{$json.certification_date}}
           - certification_url: {{$json.certification_url}}
      
      12c. Send Success Notification
           - Type: Email + Slack
           - Subject: "✅ NFT Minted Successfully!"
           - Body: |
               Your document certification is complete!
               
               NFT Address: {{$json.nft_address}}
               Certificate: {{$json.certification_url}}
               Date: {{$json.certification_date}}
               
               View on Solana Explorer:
               https://solscan.io/token/{{$json.nft_address}}
      
      12d. Update Database
           - Table: certifications
           - Insert: {
               storage_id,
               nft_address,
               certification_date,
               status: "completed"
             }
      
      12e. Generate Certificate PDF
           - Template: "certificate_template.pdf"
           - Data: {{$json}}
           - Output: "/certificates/{{storage_id}}.pdf"
      
      12f. Upload to Cloud Storage
           - Service: AWS S3 / Google Drive
           - File: {{$node["Generate PDF"].binary}}
           - Path: "/certifications/2025/{{storage_id}}.pdf"
      
      12g. Send Final Report
           - To: Stakeholders
           - Attachments: [Certificate PDF]
```

---

## 🔧 Implémentation dans le Node n8n

### **Ajouter Operation: "Wait for Certification"**

```typescript
{
  name: 'Wait for Certification',
  value: 'waitForCertification',
  description: 'Poll status until certified or timeout',
  action: 'Wait for certification completion'
}
```

**Parameters:**
```typescript
{
  displayName: 'Storage ID',
  name: 'storageId',
  type: 'string',
  required: true
},
{
  displayName: 'Polling Interval',
  name: 'pollingInterval',
  type: 'number',
  default: 300, // 5 minutes
  description: 'Seconds between status checks'
},
{
  displayName: 'Max Wait Time',
  name: 'maxWaitTime',
  type: 'number',
  default: 86400, // 24 hours
  description: 'Maximum seconds to wait before timeout'
}
```

**Execute Logic:**
```typescript
if (operation === 'waitForCertification') {
  const storageId = this.getNodeParameter('storageId', i) as string;
  const pollingInterval = this.getNodeParameter('pollingInterval', i, 300) as number;
  const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 86400) as number;
  
  const startTime = Date.now();
  const endTime = startTime + (maxWaitTime * 1000);
  
  while (Date.now() < endTime) {
    // Check status
    const statusResponse = await axios.get(
      `${baseUrl}/api/storage/${resourceType}/status/iv_route?id=${storageId}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    
    if (statusResponse.data.status === 'certified') {
      // Success!
      return {
        json: {
          success: true,
          status: 'certified',
          nft_address: statusResponse.data.nft_address,
          certification_date: statusResponse.data.certification_date,
          wait_time_seconds: (Date.now() - startTime) / 1000
        }
      };
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, pollingInterval * 1000));
  }
  
  // Timeout
  throw new Error(`Certification timeout after ${maxWaitTime} seconds`);
}
```

---

## 🎯 Recommandation Finale

### **Pour l'Instant (Phase 1) : Solution Polling**

✅ **Avantages :**
- Pas de modifications PhotoCertif nécessaires
- Fonctionne immédiatement
- Sécurisé (pas de private key)
- User garde contrôle du paiement

⚠️ **Limitations :**
- User doit payer manuellement
- Délai de 5-30 minutes selon polling
- Consomme des ressources n8n (polling)

### **À Moyen Terme (Phase 2) : Webhook Callback**

✅ **Avantages :**
- Réponse instantanée
- Pas de polling (économie ressources)
- Scalable

⚠️ **Nécessite :**
- Modification PhotoCertif (ajouter callback_url)
- n8n accessible depuis internet (webhook)

### **À Long Terme (Phase 3) : Wallet Délégué**

✅ **Avantages :**
- Vraiment automatisé
- Workflow synchrone
- Expérience optimale

⚠️ **Nécessite :**
- Wallet système PhotoCertif
- Gestion compte CHECKHC interne
- Logique de débit automatique

---

## 📝 Prochaines Étapes

**Pour continuer :**

1. **Implémenter Solution Polling** dans le node n8n
2. **Ajouter opération "Wait for Certification"**
3. **Documenter workflow exemple**
4. **Tester avec vrai cas d'usage**
5. **(Futur)** Proposer callback_url à PhotoCertif

**Voulez-vous que je :**
- A) Implémente la solution Polling dans le node ?
- B) Crée des exemples de workflows complets ?
- C) Prépare un plan pour Phase 2 (Webhook) ?

---

**Date:** 2025-01-06  
**Author:** Cascade AI  
**Status:** ✅ Solution Asynchrone Documented
