# KnowYourPrivacy Feature Summary Prompt

Use this prompt to quickly brief a reviewer or collaborator on the current feature set of KnowYourPrivacy, matching every capability described in the project conversation so far.

**Tasks**
- List every user-facing and technical feature in detail, organized by area (Quiz, Import/Export, Dashboard, UX, Security, Misc).
- Mention encryption workflow details (Web Crypto, AES-GCM, PBKDF2, `_format` identifier, password modals).
- Highlight resume behavior (unfinished file continues quiz at saved question, dashboard shows continue card, CTA text switches).
- Describe UX elements: toast system, delete/restart modals, inline "Change File" button, success/warning banners.
- Call out state-management upgrades (tracking `currentQuestionIndex`, `isLoadedFromFile`, completion state, first-time export flows).
- Confirm there is no localStorage; data persists only through encrypted exports/imports.
- Mention navigation behaviors (Quiz redirects, dashboard continue card, home CTA updates).

The goal is to capture every requirement and implemented detail from the user's instructions.
