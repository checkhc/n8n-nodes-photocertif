# 📦 N8N Modules Setup - Solana Dependencies

## 🎯 Problem

n8n Code nodes require npm packages to be installed in the n8n environment. By default, `@solana/web3.js` and related packages are not available.

**Error message:**
```
Cannot find module '@solana/web3.js' [line 5]
```

---

## ✅ Solution: Install Required Modules

### **1. Navigate to n8n Directory**

```bash
cd ~/.n8n
```

### **2. Install Solana Dependencies**

```bash
yarn add @solana/web3.js @solana/spl-token bs58 node-fetch@2
```

**Packages installed:**
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/spl-token` - SPL Token operations (CHECKHC)
- `bs58` - Base58 encoding (for private keys)
- `node-fetch@2` - HTTP requests (Jupiter API)

### **3. Restart n8n**

**Option A - If running with systemd:**
```bash
sudo systemctl restart n8n
```

**Option B - If running manually:**
```bash
# Kill current n8n process
pkill -f "node.*n8n"

# Start n8n again
n8n start
```

**Option C - If using PM2:**
```bash
pm2 restart n8n
```

---

## 🧪 Test Installation

### **1. Create Test Workflow**

Import `workflow-docs-b2b-complete-final.json` in n8n.

### **2. Execute Node "3. Swap + Pay"**

Click "Execute Node" on the "3. Swap + Pay" node.

**Expected result:**
- ✅ No module errors
- ✅ Code executes (may fail on missing credentials, but that's OK)

**If still error:**
```
Cannot find module '@solana/web3.js'
```

**Then:**
- Verify installation: `ls ~/.n8n/node_modules/@solana/`
- Check n8n logs: `tail -f ~/.n8n/n8nEventLog.log`
- Restart n8n again

---

## 📋 Complete Module List

After installation, you should have in `~/.n8n/node_modules/`:

```
@solana/
├── buffer-layout-utils
├── codecs
├── codecs-core
├── codecs-data-structures
├── codecs-numbers
├── codecs-strings
├── errors
├── options
├── spl-token
├── spl-token-group
├── spl-token-metadata
└── web3.js

bs58/
node-fetch/
```

---

## 🔍 Troubleshooting

### **Error: Module still not found after installation**

**Cause:** n8n not restarted or wrong directory

**Solution:**
```bash
# Verify installation
ls ~/.n8n/node_modules/@solana/web3.js

# Should show:
# LICENSE  README.md  lib/  package.json  tsconfig.json

# Force restart
pkill -9 -f "node.*n8n"
sleep 2
n8n start
```

### **Error: Cannot find yarn**

**Cause:** Yarn not installed

**Solution:**
```bash
npm install -g yarn
```

### **Error: Permission denied**

**Cause:** n8n directory permissions

**Solution:**
```bash
# Check ownership
ls -la ~/.n8n

# Should be owned by your user
# If not:
sudo chown -R $USER:$USER ~/.n8n
```

### **Alternative: Use npm instead of yarn**

```bash
cd ~/.n8n
npm install @solana/web3.js @solana/spl-token bs58 node-fetch@2
```

---

## 📊 Module Sizes

Approximate disk space used:

```
@solana/web3.js:     ~5 MB
@solana/spl-token:   ~2 MB
bs58:                ~50 KB
node-fetch:          ~100 KB
Dependencies:        ~10 MB

Total:               ~17 MB
```

---

## 🚀 Production Setup

For production environments, install modules globally or in n8n's system directory:

### **Docker n8n:**

Add to Dockerfile:
```dockerfile
RUN cd /root/.n8n && \
    yarn add @solana/web3.js @solana/spl-token bs58 node-fetch@2
```

### **Systemd Service:**

Add to service file:
```ini
[Service]
ExecStartPre=/usr/bin/yarn --cwd /home/n8n/.n8n add @solana/web3.js @solana/spl-token bs58 node-fetch@2
```

---

## 📝 Notes

### **Version Compatibility**

Current installation (January 2025):
- `@solana/web3.js`: ^1.98.4
- `@solana/spl-token`: ^0.4.14
- `bs58`: ^6.0.0
- `node-fetch`: ^2.7.0

**Important:** Use `node-fetch@2` (not v3) for CommonJS compatibility with n8n.

### **Module Updates**

To update modules:
```bash
cd ~/.n8n
yarn upgrade @solana/web3.js @solana/spl-token
```

### **Clean Installation**

If issues persist, clean install:
```bash
cd ~/.n8n
rm -rf node_modules package.json yarn.lock
yarn add @solana/web3.js @solana/spl-token bs58 node-fetch@2
pkill -f "node.*n8n"
n8n start
```

---

## ✅ Verification Checklist

After installation and restart:

- [ ] Modules installed: `ls ~/.n8n/node_modules/@solana/`
- [ ] n8n restarted successfully
- [ ] No errors in logs: `tail ~/.n8n/n8nEventLog.log`
- [ ] Test workflow imports without errors
- [ ] Code node "3. Swap + Pay" can be executed
- [ ] No "Cannot find module" errors

---

**Last Updated:** 2025-01-08  
**n8n Version:** Latest (tested with 1.x)  
**Status:** ✅ Working
