# 🎨 Implementation Guide - Adding media/image2 Support

## 🔍 Key Differences: media/docs vs media/image2

### **1. AI Analysis**

**media/docs (Documents):**
- ❌ NO AI analysis
- Simple file storage + blockchain certification
- No AI-related fields in DB or responses

**media/image2 (Art Certification):**
- ✅ AI analysis via Python API
- Endpoint: `http://127.0.0.1:8000/analyze/art`
- 4 certification levels
- Additional fields in responses

### **2. Database Fields**

**Additional fields for image2:**
```typescript
{
  ai_generated: boolean,          // Is AI-generated?
  ai_generated_score: number,     // AI probability (0-1)
  ai_source: string,              // Certification level (4 levels for art)
  Human_score: number,            // Human probability (1 - ai_score)
  ai_prediction_id: string        // Unique prediction ID
}
```

### **3. API Endpoints**

Both use similar structure:
```
/api/storage/docs/upload/iv_route
/api/storage/image2/upload/iv_route

/api/storage/docs/status/iv_route  
/api/storage/image2/status/iv_route

/api/storage/docs/certify/iv_route
/api/storage/image2/certify/iv_route

/api/storage/docs/download/iv_route
/api/storage/image2/download/iv_route (if exists)
```

### **4. Certification Process**

**media/docs:**
```
1. Upload document
2. Store in Irys/Arweave
3. Create NFT metadata
4. Mint NFT
```

**media/image2:**
```
1. Upload image
2. AI analysis (detectAIGeneratedImage)
3. Store in Irys/Arweave
4. Create NFT metadata + AI scores
5. Mint NFT with enriched attributes
```

---

## 🎯 Implementation Plan

### **Phase 1: Update Node Structure**

✅ Add `resourceType` parameter:
```typescript
{
  displayName: 'Resource Type',
  name: 'resourceType',
  type: 'options',
  options: [
    { name: 'Document (media/docs)', value: 'docs' },
    { name: 'Art Image (media/image2)', value: 'image2' }
  ]
}
```

### **Phase 2: Update Execute Logic**

Modify `execute()` function to:
1. Get `resourceType` parameter
2. Build endpoint dynamically: `/api/storage/${resourceType}/...`
3. Handle different response structures

### **Phase 3: Handle AI Fields**

For `image2` operations, return additional fields:
```typescript
if (resourceType === 'image2') {
  responseData = {
    ...baseResponse,
    ai_generated,
    ai_generated_score,
    ai_source,
    Human_score,
    ai_prediction_id
  };
}
```

---

## 📝 Code Changes Needed

### **File: nodes/PhotoCertif/PhotoCertif.node.ts**

#### **1. Add resourceType parameter** ✅ DONE

#### **2. Update execute() logic**

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    const operation = this.getNodeParameter('operation', i) as string;
    const resourceType = this.getNodeParameter('resourceType', i, 'docs') as string;
    const credentials = await this.getCredentials('photoCertifApi', i);

    const baseUrl = credentials.photoCertifUrl as string;
    const apiKey = credentials.apiKey as string;
    const walletPrivateKey = credentials.walletPrivateKey as string;

    // Build endpoint dynamically
    const endpoint = `/api/storage/${resourceType}`;

    let responseData: any;

    if (operation === 'upload') {
      const title = this.getNodeParameter('title', i) as string;
      const description = this.getNodeParameter('description', i, '') as string;
      const fileData = this.getNodeParameter('fileData', i, '') as string;

      const response = await axios.post(
        `${baseUrl}${endpoint}/upload/iv_route`,
        { file: fileData, title, description },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );

      responseData = response.data;
    } 
    else if (operation === 'getStatus') {
      const storageId = this.getNodeParameter('storageId', i) as string;

      const response = await axios.get(
        `${baseUrl}${endpoint}/status/iv_route?id=${storageId}`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );

      responseData = response.data;
    } 
    else if (operation === 'certify') {
      const storageId = this.getNodeParameter('storageId', i) as string;
      const metadataStr = this.getNodeParameter('metadata', i, '{}') as string;
      
      let metadata = {};
      try {
        metadata = JSON.parse(metadataStr);
      } catch (e) {
        throw new NodeOperationError(this.getNode(), 'Invalid JSON in metadata field');
      }

      const response = await axios.post(
        `${baseUrl}${endpoint}/certify/iv_route`,
        { id: storageId, metadata, walletPrivateKey },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );

      responseData = response.data;
    } 
    else if (operation === 'download') {
      const storageId = this.getNodeParameter('storageId', i) as string;

      const response = await axios.get(
        `${baseUrl}${endpoint}/download/iv_route?id=${storageId}`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );

      responseData = response.data;
    }

    returnData.push({
      json: responseData,
      pairedItem: { item: i },
    });
  }

  return [returnData];
}
```

---

## 🧪 Testing Checklist

### **Test media/docs (existing)**
- [ ] Upload document
- [ ] Get status
- [ ] Certify document
- [ ] Download document

### **Test media/image2 (new)**
- [ ] Upload art image
- [ ] Get status (verify AI fields present)
- [ ] Certify art (verify AI analysis triggered)
- [ ] Check NFT metadata includes AI scores
- [ ] Download certified art

---

## 🔒 Security Considerations

### **Private Key Handling**
Both `docs` and `image2` use the same private key for NFT minting:
- ✅ Encrypted in n8n credentials
- ✅ Transmitted via HTTPS only
- ✅ Used for signing blockchain transactions
- ✅ Destroyed after use

### **API Key Scopes**
Ensure API key has appropriate scopes:
```
docs:read
docs:upload
docs:write
image2:read     (if different from docs)
image2:upload   (if different from docs)
image2:write    (if different from docs)
```

---

## 📊 Expected Response Differences

### **Upload Response**

**docs:**
```json
{
  "success": true,
  "storage_id": "iv_123",
  "message": "Document uploaded"
}
```

**image2:**
```json
{
  "success": true,
  "storage_id": "iv_123",
  "message": "Image uploaded"
}
```

### **Status Response**

**docs:**
```json
{
  "id": "iv_123",
  "title": "Contract",
  "status": "certified",
  "nft_address": "ABC..."
}
```

**image2:**
```json
{
  "id": "iv_123",
  "title": "Artwork",
  "status": "certified",
  "nft_address": "ABC...",
  "ai_generated": false,
  "ai_generated_score": 0.12,
  "ai_source": "HUMAN_CREATED",
  "Human_score": 0.88,
  "ai_prediction_id": "pred_xyz"
}
```

---

## 🚀 Next Steps

1. **Complete code changes** in PhotoCertif.node.ts
2. **Build and test** locally with both resource types
3. **Update README.md** with image2 examples
4. **Create test workflows** for both docs and image2
5. **Commit and push** to GitHub
6. **Test in production** n8n instance

---

## ⚠️ Important Notes

### **From MEMORY:**

**DO NOT UNIFORMIZE** the flows!
- media/image (Basic) → Pinata IPFS
- media/image2 (Art) → Irys/Arweave + AI analysis
- media/image3 (Premium) → Irys/Arweave + different AI endpoint
- media/docs → Irys/Arweave, no AI

Each has specific logic and MUST be preserved.

### **API Authentication**

Current implementation passes `walletPrivateKey` in request body to PhotoCertif API.

**TODO:** Verify PhotoCertif API actually accepts and uses this private key for server-side signing, or if it still requires client-side wallet connection.

---

## 📝 Status

- [x] Analysis complete
- [x] Differences documented
- [ ] Code changes implemented
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Pushed to GitHub

---

**Author:** Cascade AI Assistant
**Date:** 2025-01-06
**Project:** n8n-nodes-photocertif
