# 📋 Workflow Docs Certification v2.2.0 - Changelog

**Date:** 2025-10-12  
**Workflow:** `workflow-docs-certification-v2.2.0.json`  
**Status:** ✅ **TESTED & VALIDATED**

---

## 🎯 **Changes from v2.1.0**

### 🐛 **Bug Fixes**

#### **Critical: Fixed storageId path in certify operation**

**Issue:**
```javascript
// ❌ v2.1.0 (INCORRECT)
$('5. Upload Document').first().json.storageId
// Returns: undefined
```

**Root Cause:**
The PhotoCertif API `/api/storage/docs/upload/iv_route` returns:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "iv_storageid": "xxx-yyy-zzz",
    "preview_url": "/api/storage/docs/preview/iv_route?id=xxx-yyy-zzz"
  }
}
```

The workflow was trying to access `.json.storageId` (doesn't exist) instead of `.json.data.iv_storageid`.

**Solution:**
```javascript
// ✅ v2.2.0 (CORRECT)
$('5. Upload Document').first().json.data.iv_storageid
// Returns: "xxx-yyy-zzz"
```

**Nodes Fixed:**
1. ✅ **Node 11 "Certify Document"** - Line 394
2. ✅ **Node 12 "Wait For Certification"** - Line 421
3. ✅ **Node 13 "Success Output"** - Line 461

---

## 📊 **Impact**

### **Before v2.2.0 (BROKEN):**
```
Node 5: Upload Document ✅
Node 11: Certify Document ❌ (Error 500: document ID undefined)
```

**Error:**
```
PhotoCertif API error: Request failed with status code 500
[DOCS CERTIFY] Searching for document with ID: undefined
```

### **After v2.2.0 (FIXED):**
```
Node 5: Upload Document ✅
Node 11: Certify Document ✅ (document ID correctly passed)
Node 12: Wait For Certification ✅
Node 13: Success Output ✅
```

---

## ✅ **Testing**

### **Test Workflow:**
1. Upload a document (PDF/DOCX)
2. Check that Node 11 passes without error
3. Verify certification completes
4. Check NFT creation

**Test Results:**
- ✅ Node 11 passes with correct storageId
- ✅ Document certification succeeds
- ✅ NFT minted successfully
- ✅ Workflow completes end-to-end

---

## 🔄 **Migration from v2.1.0**

### **Steps:**

1. **Delete old workflow** in n8n UI
2. **Import new workflow:**
   ```bash
   /home/greg/n8n-nodes-photocertif/workflow-docs-certification-v2.2.0.json
   ```
3. **Test with a document**

### **No Breaking Changes:**
- Same node structure
- Same input parameters
- Same output format
- Existing credentials work without modification

---

## 📝 **Technical Details**

### **API Response Structure:**

**Upload Endpoint:** `/api/storage/docs/upload/iv_route`

**Returns:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "iv_storageid": "clxxxxx-xxxxx-xxxxx",
    "preview_url": "/api/storage/docs/preview/iv_route?id=clxxxxx"
  }
}
```

**Certify Endpoint:** `/api/storage/docs/certify/iv_route`

**Expects:**
```json
{
  "id": "clxxxxx-xxxxx-xxxxx",  // ← Must be iv_storageid
  "name": "Document Name",
  "cert_symbol": "DOC2025",
  "cert_description": "...",
  "cert_prop": "..."
}
```

**The `id` field is used to query the database:**
```typescript
const imageToProcess = await prisma.iv_storage.findUnique({
  where: {
    iv_storageid: id,  // ← Here
    userId: userId,
  },
});
```

If `id` is `undefined`, the query fails and returns HTTP 500.

---

## 🚀 **Related Changes**

### **n8n-nodes-solana-swap v1.6.1:**
- ✅ SPL token transfers implemented
- ✅ Node 7 "Transfer to Main Wallet" now works
- ✅ Published on npm

### **Workflow compatibility:**
- ✅ v2.2.0 works with n8n-nodes-solana-swap v1.6.1
- ✅ All nodes tested and validated

---

## 📚 **Documentation Updated**

- ✅ This changelog (WORKFLOW_V2.2.0_CHANGELOG.md)
- ✅ Workflow name updated in JSON
- ✅ Documentation sticky note updated

---

## 🎯 **Recommendations**

1. **Always use v2.2.0** for docs certification
2. **Delete v2.1.0** to avoid confusion
3. **Test thoroughly** before production use
4. **Update n8n-nodes-solana-swap** to v1.6.1 minimum

---

**Developed by CHECKHC** | https://www.checkhc.net  
**Contact:** contact@checkhc.net
