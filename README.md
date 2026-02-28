# KnowYourPrivacy

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/jonaslouison/KnowYourPrivacy)](https://github.com/jonaslouison/KnowYourPrivacy/issues)

A privacy-focused quiz web app that helps users understand and improve their digital privacy. All data is processed client-side with encryption - no servers, no tracking, no accounts required.

## Features

- 🔒 **100% Client-Side**: All processing happens in your browser
- 🔐 **Encrypted Data**: Your answers are encrypted with a password only you know
- 🚫 **No Tracking**: No analytics, no cookies, no data collection
- 📊 **Personalized Dashboard**: Get recommendations based on your threat model
- 💾 **Local Export**: Save your encrypted data to your device
- 🌐 **Open Source**: Fully transparent and auditable code

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Privacy Principles

- No server-side data storage
- No user accounts or authentication
- Client-side encryption using Web Crypto API
- Static site generation for minimal attack surface
- All data stays on your device

## Tech Stack

- Vue 3 + Vite
- Pinia for state management
- Vue Router for navigation
- Web Crypto API for encryption
- GitHub Pages for hosting

## License

This project is licensed under the [MIT License](LICENSE).

## Third-Party Data

The `privacyguides.org-main/` directory contains content from [Privacy Guides](https://www.privacyguides.org/), which is used as a data source for recommendations. It is a separate project with its own licensing — see its [LICENSE](privacyguides.org-main/LICENSE) for details.

## Contributing

Contributions are welcome! Please open an [issue](https://github.com/jonaslouison/KnowYourPrivacy/issues) to report bugs or suggest features, or submit a pull request.
