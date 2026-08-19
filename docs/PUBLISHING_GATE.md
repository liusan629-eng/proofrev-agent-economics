# Publishing gate

Target public repository:

`liusan629-eng/proofrev-agent-economics`

## Already automated in this package

- Local JavaScript tests.
- Local Python tests.
- GitHub CI for both languages.
- GitHub release workflow for npm and PyPI.
- OIDC-ready publishing workflow with no long-lived registry token committed to the repository.
- npm and PyPI package metadata.

## Human-controlled account steps that cannot be delegated

1. Create the public GitHub repository `liusan629-eng/proofrev-agent-economics` and authorize the connected GitHub integration for it.
2. npm: create/sign in to the npm account, enable required 2FA, and perform the first package publication.
   After the package exists, configure GitHub Actions trusted publishing for workflow `publish.yml`.
3. PyPI: create/sign in to the PyPI account and add a pending GitHub trusted publisher for:
   - Owner: `liusan629-eng`
   - Repository: `proofrev-agent-economics`
   - Workflow: `publish.yml`
   - PyPI project: `proofrev-agent-economics`
4. Any Terms acceptance, CAPTCHA, OTP/2FA, passkey, identity/tax verification, or payout setup must be completed by the account holder.

Do not paste private keys, seed phrases, one-time codes, or passwords into repository files or chat.
