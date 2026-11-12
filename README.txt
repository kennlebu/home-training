Home training

A private, installable web app for home and gym strength training, general fitness and running.

The app stores its profile, schedule, active session and history in the current browser. It does not sync across devices. The backup and restore controls are under Your setup, then Data, backup and installation. Calendar export creates an ICS file with a 15 minute reminder. Calendar software handles the reminder after import.

The exercise illustrations are original 3D movement diagrams. They do not use paid media or external graphics libraries. They are simplified illustrations rather than captured biomechanics or form assessment. Exercise cues and training templates have not received independent review by a qualified trainer. Reference links are available in the app.

Application source is in src. The interface uses React and customised shadcn/ui components from the official registry. Vite builds a static app into dist. HTTPS is needed for installation and service worker support. Opening index.html directly from disk will not provide the full app experience.

To run locally from this folder

npm ci
npm run dev

Open the local address printed by Vite. To build the hosted files, run npm run build.

To run the automated checks

npm test

The tests cover equipment selection, full session timing, recovery, mixed home and gym sessions, running feasibility, calendar timezone conversion, backup validation, shortening, repeat weeks, progression and movement geometry.

Browser checks passed for the default palette, Ink and Mint dark mode, Slate and Cobalt, saved preferences after reload, programme preview, a recorded set, resuming it after switching themes, and saving a partial session. Layouts were checked at 320, 390 and 1280 pixels with no horizontal page overflow. Physical phone installation and offline behaviour remain unverified.

Application structure

src/app.js contains screens, recording, timer controls and app navigation.
src/planner.js contains workout selection, timing, scheduling and calendar export.
src/exercises.js contains exercise descriptions, equipment, alternatives and reference links.
src/model.js contains the original 3D movement diagrams and their viewer.
src/storage.js validates saved records and imported backups.
src/adaptation.js contains shortening and repeat week rules.
vite.config.js generates the service worker with the current bundled files for offline use after an initial visit.

The hosting identity is recorded in .openai/hosting.json. No credentials belong in this repository. Preserve that identity for future updates. Personal training records are not part of the source or deployment archive.

Design system and preferences

Forest and Ivory is the default palette, with a light appearance. Ink and Mint and Slate and Cobalt are available from Appearance in the header. Each supports light, dark or following the device.

src/themes.js owns the complete semantic colour roles, persistence and appearance changes. Preferences use home-training-appearance-v1, separately from home-training-state-v1 and the setup draft. Existing workout data keeps the same format and storage keys.

src/ui-adapter.jsx renders the existing training screens with React and shadcn Button, Card, Input, Textarea, Dialog and DropdownMenu components. Native checkboxes and selects preserve the established form handling. Dialogs provide keyboard focus management. The training rules remain in their original modules.

src/design-system.css maps shadcn roles to Tailwind. src/theme-overrides.css applies the custom identity to the existing layouts. The 3D guide reads the selected palette and updates when it changes.

The official shadcn component sources and licence are documented in THIRD_PARTY_NOTICES.txt.
