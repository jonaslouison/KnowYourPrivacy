## Quiz Flow
13-question privacy assessment with progress bar, per-question navigation, and score calculations.
Answers kept in Pinia store (answers, currentQuestionIndex, isCompleted) and never stored in localStorage.
“Save Progress” button exposed mid-quiz triggers encrypted export (AES-GCM via Web Crypto + PBKDF2) that captures answers, completion flag, and current question index.
Restart option (modal-confirmed) clears answers/state and lets users start over.
Completing the last question shows a congratulations screen with “View Dashboard.”

## Import/Export & Persistence
Export/import workflows require password modals (custom UI, inline “Change File” button, toast feedback) and validate _format: 'knowyourprivacy-v1'.
Encrypted exports are the only persistence mechanism—no tracking/localStorage; data resides only on the file.
Importing an unfinished file restores answers and currentQuestionIndex and sets isLoadedFromFile, allowing resume at the exact saved question.
Completed-file loads keep users on the dashboard, unfinished-file loads redirect back into the quiz at the saved position.

## Dashboard Logic
Shows privacy score, threat model, app categories, recommendations, and actions (export, import, retake, delete) when quiz is completed.
Banners:
“Unsaved Data” warning appears only for new answers that haven’t been exported and weren’t loaded from a file.
“Your Quiz is currently saved in this file” success banner shows when data was loaded from a file (regardless of completion).
If data exists but quiz is unfinished (or loaded unfinished file), the dashboard hides analytics and instead shows a “Continue Your Quiz” card with button and question progress; CTA prompts users to resume.

## Home & Navigation
Hero CTA and description emphasize privacy insights; CTA text flips between “Start Privacy Quiz” and “See Quiz Answers” depending on whether a file is loaded/unfinished.
Loading a file from the home screen opens password modal, and successful imports route to the quiz (unfinished data) or dashboard (completed data).

## UX & Error Handling
Toast system handles success/error feedback globally.
Delete and restart actions use confirmation modals.
Password modals display filename, allow changing the file inline, and show errors directly without clearing the input.
Continue/empty states use cards with contextual instructions and buttons.

## Security & Technical Notes
AES-GCM encryption with PBKDF2 (Web Crypto API) for exports; downloadEncryptedFile() handles file creation.
Import validation runs before decryption (validateExportFile) and post-decryption (_format check).
State management tracks currentQuestionIndex, isLoadedFromFile, and completion to adjust UI flows and export payloads.
Dashboard shows different content for no data, unfinished resumes, and completed sessions, ensuring users always see the right prompt.