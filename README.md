# PromptForge (Simple AI Prompt Optimizer)

PromptForge is a security-first, high-performance meta-prompt optimizer designed for AI-assisted programming workflows. It turns simple, brief drafts into structured, highly detailed, and contextual prompts utilizing Gemini and OpenRouter models.

---

## 🔒 Security & Privacy Policy

- **Zero-Server Key Storage**: Your API keys are strictly saved in your browser's local sandbox environment (`localStorage`). They are never uploaded, logged, or sent to any server other than the direct AI provider APIs.
- **Sanitized Inputs**: Built-in sanitization routines intercept user inputs and JSON imports to neutralize script injection vectors while preserving standard XML formatting tags.
- **Hidden Credentials**: Network exception boundaries sanitize all errors, replacing sensitive query values and API key signatures with `***HIDDEN***` placeholders.

### Responsible Vulnerability Disclosure
If you find a security vulnerability, please do not open a public GitHub issue. Instead, report it privately to `security@promptforge.local` to ensure a coordinated disclosure process.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/lokaditchi/prompt-optimizer-v1.git
   cd prompt-optimizer-v1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## 🛡️ Secure Deployment Checklist

Follow this checklist to initialize your repository securely:

- [ ] **Run Security Audits**: Run `npm audit` before committing code to check for known vulnerabilities in dependencies.
- [ ] **Setup Ignore Rules**: Ensure `.gitignore` successfully blocks `.env` and local caches.
- [ ] **Integrate Static Analysis**: Use GitHub Actions for automated static analysis (CodeQL, Dependency Review).
- [ ] **Lock Branch Protection**: Enable branch protection on `main` to prevent direct unreviewed force-pushes.

---

## 💻 Contribution Guidelines

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/SecureFeature`).
3. Commit your changes (`git commit -m 'feat: add secure credential helper'`).
4. Push to the Branch (`git push origin feature/SecureFeature`).
5. Open a Pull Request.
