Home training

A private, installable web app for home and gym strength training, general fitness and running.

The app stores its profile, schedule, active session and history in the current browser. It does not sync across devices. The backup and restore controls are under Your setup, then Data, backup and installation. Calendar export creates an ICS file with a 15 minute reminder. Calendar software handles the reminder after import.

The exercise illustrations are original 3D movement diagrams. They do not use paid media or external graphics libraries. They are simplified illustrations rather than captured biomechanics or form assessment. Exercise cues and training templates have not received independent review by a qualified trainer. Reference links are available in the app.

Application files are in dist. The app has no build step or runtime package dependencies. It needs a static HTTP server for JavaScript modules and HTTPS for installation and service worker support. Opening index.html directly from disk will not provide the full app experience.

To run locally from this folder

python3 -m http.server 8766 --bind 127.0.0.1 --directory dist

Then open http://127.0.0.1:8766 in a browser.

To run the automated checks

npm test

The tests cover equipment selection, full session timing, recovery, mixed home and gym sessions, running feasibility, calendar timezone conversion, backup validation, shortening, repeat weeks, progression and movement geometry.

Browser preview was unavailable in the authoring environment. Actual browser interactions, responsive layout, phone installation and offline behaviour remain unverified. Do not treat the automated checks as evidence that those visual and device checks passed.

Application structure

dist/app.js contains screens, recording, timer controls and app navigation.
dist/planner.js contains workout selection, timing, scheduling and calendar export.
dist/exercises.js contains exercise descriptions, equipment, alternatives and reference links.
dist/model.js contains the original 3D movement diagrams and their viewer.
dist/storage.js validates saved records and imported backups.
dist/adaptation.js contains shortening and repeat week rules.
dist/sw.js caches application files for offline use after an initial visit.

The hosting identity is recorded in .openai/hosting.json. No credentials belong in this repository. Preserve that identity for future updates. Personal training records are not part of the source or deployment archive.
