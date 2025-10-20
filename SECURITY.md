# Security Policy

## Supported Versions

We actively support the latest version of n8n-nodes-photocertif.

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities publicly via GitHub Issues.**

If you discover a security vulnerability, please send an email to:

**security@checkhc.net**

We will respond within 48 hours and work with you to understand and resolve the issue promptly.

## Security Best Practices

When using this node:

1. **Never hardcode credentials** - Always use n8n's credential system
2. **Use dedicated wallets** - Don't use your main Solana wallet for automation
3. **Limit funds** - Store only necessary amounts (0.1-0.5 SOL + 1000-10000 CHECKHC)
4. **Rotate API keys** - Regenerate keys periodically
5. **Monitor usage** - Check API logs regularly for suspicious activity
6. **Secure your n8n instance** - Use HTTPS, strong passwords, and proper authentication

## Data Handling

This node:
- ✅ Does NOT store any credentials locally
- ✅ Does NOT log sensitive data
- ✅ Transmits all data over HTTPS only
- ✅ Uses n8n's encrypted credential storage

All data processing happens on PhotoCertif's backend, which follows industry-standard security practices.

## Disclosure Policy

We follow responsible disclosure practices:
1. Report received → Acknowledgment within 48h
2. Investigation → Fix developed
3. Security patch released
4. Public disclosure (30 days after fix)

Thank you for helping keep n8n-nodes-photocertif secure! 🔒
