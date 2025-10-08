# 🚧 Limitations du Workflow B2B et Solutions

## ✅ Ce qui est Automatisé

### **Workflow n8n Actuel**
```
1. Get Pricing               ✅ API server
2. Upload Document           ✅ API server  
3. Auto-Swap SOL → CHECKHC   ✅ Jupiter (si besoin)
4. Pay Certification         ✅ Transfer CHECKHC
```

**Résultat** : L'utilisateur peut venir avec **SOL uniquement**, tout le swap et paiement est automatique.

---

## ❌ Ce qui Manque pour 100% Automation

### **Étapes Manquantes**
```
5. Upload vers Irys      ❌ Actuellement côté client (navigateur)
6. Mint NFT              ❌ Actuellement côté client (navigateur)
7. Transfer NFT          ❌ Actuellement côté client (navigateur)
```

---

## 🔍 Analyse du Problème

### **Flux Web (Navigateur)** - Fonctionne ✅

**Fichier** : `/src/app/media/docs/certification/page.tsx`

```typescript
// L'utilisateur clique sur BuyCHECKHCAndCreateNFTButton

// 1. Auto-swap SOL → CHECKHC (si besoin)
await handleAutoBuyCHECKHC(...)

// 2. Paye la certification
await connection.sendTransaction(...)

// 3. Upload vers Irys (côté client/navigateur)
await uploadBlobToIrys(originalBlob, ..., solanaWallet!)
await uploadBlobToIrys(resizedBlob, ...)
await uploadJsonToIrysBrowser(metadata, ..., solanaWallet!)

// 4. Mint NFT (côté client)
await createStandardNft(...)

// 5. Update database
await fetch('/api/storage/docs/update-irys-urls', ...)
```

**Clés** :
- ✅ `solanaWallet` = wallet connecté du navigateur
- ✅ Signature Irys avec clé privée du wallet
- ✅ Mint NFT signé par le wallet de l'utilisateur

---

### **Flux n8n (Server)** - Incomplet ❌

**Endpoint** : `/api/storage/docs/certify-with-payment/route.ts`

```typescript
export async function POST(req: NextRequest) {
  // 1. Vérifie API key
  const authResult = await authenticateApiKey(req);
  
  // 2. Vérifie paiement CHECKHC
  const paymentVerification = await verifyPaymentTransaction(...)
  
  // 3. Update status
  await prisma.iv_storage.update({
    where: { iv_storageid: storage_id },
    data: { status: 'PROCESSING' }
  });
  
  // ❌ TODO: Implement server-side NFT minting (ligne 204)
  // ❌ Pas d'upload Irys
  // ❌ Pas de mint NFT
  
  return NextResponse.json({
    nft_address: 'PENDING_MINT', // ❌ Pas de vrai NFT
    status: 'PROCESSING'
  });
}
```

**Problème** :
- ❌ Pas de wallet server-side pour signer Irys
- ❌ Pas de mint NFT côté serveur
- ❌ L'endpoint ne fait que vérifier le paiement

---

## 💡 Solutions Possibles

### **Option 1: Utiliser l'Interface Web (Actuel)** ⭐ Recommandé

**Workflow** :
```
n8n: 
1. Upload ✅
2. Swap + Pay ✅
3. Return storage_id
