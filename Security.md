# Security Policy for MagicAppDev Mobile App

## Supported Versions

Currently, only the latest version of the mobile application is supported.

| Version | Supported |
| ------- | --------- |
| Latest  | ✅        |
| Older   | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability in the MagicAppDev mobile app, please report it responsibly.

### How to Report

1. **Email**: Send an email to `security@magicappdev.workers.dev`
2. **GitHub Security Advisory**: Create a draft Security Advisory on GitHub
3. **Include Details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue
- You will be credited in the security advisory (unless you wish to remain anonymous)

## Security Features

### Authentication

- OAuth 2.0 integration with GitHub and Discord
- Secure token storage via Ionic Storage
- Automatic token refresh

### Data Protection

- All API communications over HTTPS
- Sensitive data stored securely on device
- No sensitive data in application logs

### Network Security

- Certificate pinning (for production API endpoints)
- Request/response validation
- Protection against common web vulnerabilities (XSS, CSRF)

### Code Security

- Static code analysis (CodeQL)
- Dependency scanning
- Secure build pipeline

## Development Security Practices

### Secrets Management

- No hardcoded credentials in source code
- Environment variables for sensitive configuration
- Separate secrets for development/staging/production

### Dependencies

- Regular dependency updates
- Automated dependency scanning
- Pull request reviews for dependency changes

### Testing

- Security-focused unit tests
- Integration tests for authentication flows
- Penetration testing before major releases

## Security Advisories

We maintain a security advisories page where we publish information about security vulnerabilities and their fixes.

## Security Best Practices for Users

1. **Keep the app updated**: Install updates promptly
2. **Use strong OAuth providers**: Link accounts with reputable providers (GitHub, Discord)
3. **Report suspicious activity**: Contact us if you notice unusual behavior
4. **Secure your device**: Use device lock screen and encryption

## Security Contact

For general security questions or concerns:

- Email: security@magicappdev.workers.dev
- GitHub: https://github.com/magicappdev/magicappdev/security/advisories

## Policy Last Updated

January 2025
