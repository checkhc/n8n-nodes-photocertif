# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
