# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-10

### 🚀 Major Refactoring: Architecture Modulaire

**⚠️ BREAKING CHANGE:** Removed `SolanaWallet` credential in favor of `SolanaApi` from `n8n-nodes-solana-swap`

### Changed
- **Removed duplicate Solana dependencies** (@solana/web3.js, @solana/spl-token, bs58)
  - Now relies on `n8n-nodes-solana-swap` package as peerDependency
  - Reduces package size and eliminates code duplication
  - Centralizes Solana logic maintenance
  
- **Removed `SolanaWallet` credential**
  - Use `SolanaApi` credential from n8n-nodes-solana-swap instead
  - More complete with RPC type selection (public/custom)
  - Reusable across multiple n8n nodes
  
- **Updated architecture to composable design**
  - PhotoCertif focuses on certification logic only
  - Solana operations delegated to n8n-nodes-solana-swap
  - Users build workflows by combining nodes

### Added
- **peerDependencies**: `n8n-nodes-solana-swap ^1.5.0`
- **Complete workflow example** in README
  - Step-by-step PhotoCertif + SolanaSwap integration
  - Shows balance check, swap, transfer, certify flow
  - Demonstrates composability benefits

### Removed
- `credentials/SolanaWallet.credentials.ts` (replaced by SolanaApi)
- Direct Solana dependencies from package.json

### Migration Guide
For existing users:

**Before (v1.0.2):**
```bash
npm install n8n-nodes-photocertif
```
Use `SolanaWallet` credential

**After (v1.1.0):**
```bash
npm install n8n-nodes-solana-swap n8n-nodes-photocertif
```
Use `SolanaApi` credential (from solana-swap package)

**Workflow Update:**
1. Install `n8n-nodes-solana-swap` package
2. Replace `SolanaWallet` credential with `SolanaApi`
3. Use `SolanaNode` for token transfers/swaps
4. PhotoCertif node handles certification only

### Benefits
- ✅ **30% smaller package** (no duplicate Solana deps)
- ✅ **Better composability** (mix-and-match n8n nodes)
- ✅ **Centralized updates** (Solana logic in one place)
- ✅ **More flexible** (custom payment workflows)
- ✅ **Reusable credentials** (one Solana config for all)

---

## [1.0.2] - 2025-01-08

### Security
- **CRITICAL:** Fixed SSRF (Server-Side Request Forgery) vulnerability in file URL downloads
  - Added `validateUrl()` function to block internal/private IP access
  - Blocks non-HTTP/HTTPS protocols (file://, ftp://, etc.)
  - Blocks localhost, 127.0.0.1, ::1, and AWS metadata endpoint (169.254.169.254)
  - Blocks private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  
- **CRITICAL:** Added request timeouts to prevent indefinite hanging
  - REQUEST_TIMEOUT: 30 seconds for API calls
  - DOWNLOAD_TIMEOUT: 120 seconds for file downloads
  - Applied to all 7 axios requests (upload, getStatus, certify, waitForCertification, download, getPricing)
  
- **CRITICAL:** Added file size limits to prevent memory exhaustion
  - MAX_FILE_SIZE: 10MB maximum for file uploads
  - maxContentLength and maxBodyLength enforced on axios downloads
  
- **CRITICAL:** Sanitized error messages to prevent sensitive data exposure
  - No longer exposes full `error.response?.data` in error responses
  - Prevents API keys, tokens, and internal paths from leaking in logs
  
- **HIGH:** Added minimum polling interval protection
  - MIN_POLLING_INTERVAL: 10 seconds minimum enforced
  - Prevents API spam and rate limiting issues
  - Applied to `waitForCertification` operation

### Changed
- Updated package version to 1.0.2
- Improved code documentation with security comments

### Notes
- All changes are backwards compatible (no breaking changes)
- Existing workflows will continue to work without modifications
- File uploads from URLs now have better security and stability

## [1.0.1] - 2024-12-XX

### Added
- Added `fileExtension` parameter for URL uploads (Google Drive support)
- Support for files without extensions in URL (e.g., Google Drive shared links)

### Fixed
- Fixed file naming issues with Google Drive URLs
- Improved error handling for file uploads

## [1.0.0] - 2024-11-XX

### Added
- Initial release
- PhotoCertif API integration for n8n
- Support for document certification on Solana blockchain
- Operations: upload, certify, getStatus, waitForCertification, download, getPricing
- Support for both document (media/docs) and art (media/image2) certification
- Base64 and URL input types for file uploads
- Comprehensive error handling
- Polling mechanism for certification status
