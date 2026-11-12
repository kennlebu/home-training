Home training

An installable web app for home and gym strength training, general fitness and running.

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

Browser checks passed for the default palette, Ink and Mint dark mode, Slate and Cobalt, saved preferences after reload, programme preview, a recorded set, resuming it after switching themes, and saving a partial session. Layouts were checked at 320, 390 and 1280 pixels with no horizontal page overflow. Offline browser checks passed after stopping the local server. The app reopened with its bundled fonts and movement guide, recorded a set and restored that set after a reload. Update controls stayed disabled during a workout and worked after saving a partial session. Phone layouts at 320 and 390 pixels and desktop at 1280 pixels had no horizontal overflow. Sidebar labels share the same starting position. Physical iPhone and Android installation remain unverified.

Application structure

src/app.js contains screens, recording, timer controls and app navigation.
src/planner.js contains workout selection, timing, scheduling and calendar export.
src/exercises.js contains exercise descriptions, equipment, alternatives and reference links.
src/model.js contains the original 3D movement diagrams and their viewer.
src/storage.js validates saved records and imported backups.
src/adaptation.js contains shortening and repeat week rules.
vite.config.js and scripts/service-worker-source.js generate the service worker with the current bundled files. It prepares the app, fonts, icons and movement guides for offline use. Navigation falls back to the prepared page after a failed request or a 3.5 second timeout. Asset retrieval ignores request header variation for these same-origin static files. Each worker uses its own matching page and assets. Upgrades wait until the user chooses Update and reopen.

src/device-support.js manages installation, offline readiness and update events. src/device-ui.jsx provides the status and installation panel. A current workout prevents the app from requesting an update or reloading for one. Offline status reports whether the browser can reach this app, rather than claiming every internet service is reachable. Browser storage can be cleared or evicted. Storage protection can be requested, and backups remain available.

The hosting identity is recorded in .openai/hosting.json. No credentials belong in this repository. Preserve that identity for future updates. Personal training records are not part of the source or deployment archive.

Design system and preferences

Forest and Ivory is the default palette, with a light appearance. Ink and Mint and Slate and Cobalt are available from Appearance in the header. Each supports light, dark or following the device.

src/themes.js owns the complete semantic colour roles, persistence and appearance changes. Preferences use home-training-appearance-v1, separately from home-training-state-v1 and the setup draft. Existing workout data keeps the same format and storage keys.

src/ui-adapter.jsx renders the existing training screens with React and shadcn Button, Card, Input, Textarea, Dialog and DropdownMenu components. Native checkboxes and selects preserve the established form handling. Dialogs provide keyboard focus management. The training rules remain in their original modules.

src/design-system.css maps shadcn roles to Tailwind. src/theme-overrides.css applies the custom identity to the existing layouts. The 3D guide reads the selected palette and updates when it changes.

The official shadcn component sources and licence are documented in THIRD_PARTY_NOTICES.txt.

Offline and phone use

Wait until the app status says Ready offline before depending on it without a connection. Select that status to open installation guidance, or use Your setup, then Data, backup and installation. Supported browsers can offer an Install Home training button. Other browsers show steps for Safari and Chrome. PNG icons cover Android installation and Apple home screen use.

External exercise references still need a connection. Timers catch up when the app is reopened. The app does not send background notifications. Records stay in each browser and device, with backup transfer available. The bundled fonts use the SIL Open Font License recorded in THIRD_PARTY_NOTICES.txt.

The offline automated checks include interrupted downloads, offline navigation and assets with request header variations, cache separation, update activation, preserving unrelated browser caches, and refusing updates during an active session.

Training review and session adjustments

Version 2.2 adds a training review under Your progress. It uses the last 14 calendar days in the profile timezone and shows completed sessions, partial sessions, sessions marked too hard and sessions with reported discomfort. Partial work is not assumed to mean poor recovery. The latest strength feedback guides the text. Discomfort leads to reviewing movement choices, rather than treating fewer sets as a remedy.

A lighter session can be previewed from Your progress or a planned strength session summary. It removes one set from movements with more than one set, preserving at least one set, the exercise, load, repetition target, rest, date and time limit. The comparison shows every change and recalculates the duration. Accepting changes one planned session only. Restore previous sets is available before starting, provided later edits would not be overwritten and the original work still fits the time slot. Active workouts prevent these changes. A lighter plan is excluded from progression updates.

The optional adjustment record holds the previous and adjusted prescriptions. Backup validation checks both. Existing backup files without this field remain compatible. Session history is not rewritten. A failed browser save leaves the preview open and returns the schedule to its prior in-memory state.

Movement record shows up to eight recent sessions for a chosen recorded exercise. It preserves repetitions, timed holds, single side units, per-hand loads, band names, effort and partial completion. Older records remain in the full history. It does not estimate maximum strength from those records.

src/training-insights.js prepares the review and exercise timelines. src/insights-view.js renders them. src/adaptation.js owns lighter and restore rules. tests/training-review.test.mjs covers history windows, feedback ordering, honest partial records, immutable previews, restoration, backup validation, movement records and progression after an unlogged prescribed movement. There are now 41 passing automated checks.

Browser checks for this phase passed for cancellation, applying and restoring a lighter session, keeping it after reload, protecting an active session, logging two movements and an overall hard effort, changing the movement record, 320 and 390 pixel layouts, and reopening the new review and movement record with the preview server stopped. Physical phone installation and independent trainer review remain outstanding.

Movement illustrations and professional videos

Version 2.3 keeps authored, rotatable illustrations and applies fixed upper arm, forearm, thigh, shin and torso lengths across all 27 movements. The limb solver avoids interpolation that stretches the skeleton. The proportions describe our simplified illustration and are not measured human biomechanics.

Specific corrections include opposite-limb dead bug and bird dog reaches on both sides, a straight reaching arm, a steady trunk, a straight trunk and leg line in planks and push-ups, bench press feet resting on the floor, a vertical goblet dumbbell, a closer RDL weight path, wall squat feet ahead of the hips, ball curl heel contact and kneeling wheel contact. Switch side preserves the inspected movement position. Camera framing fits the full animation across front, side and rotated views, including small phone canvases. Dead bug, bird dog and marching alternate during playback. Split squats and side planks change sides when requested.

movement-review.json records the scope precisely. All 27 movements passed the geometry checks. Eleven movements have a specific professional reference check recorded against NASM, ACE or Catalyst Athletics. The other 16 received the shared geometry corrections but still need individual reference checks. None has independent trainer approval. Source guidance was used to author our own illustrative motion. No third-party animation, photograph or video was copied into the app.

Eight exercises have videos linked from NASM's own exercise pages and returned as embeddable by YouTube oEmbed on 12 November 2026. Each returned the matching title and the official NASM channel. The exercises are goblet squat, dumbbell Romanian deadlift, floor bridge, dead bug, bird dog, plank, push-up and side plank. The goblet video shows a kettlebell, which is disclosed next to the player because our illustration uses a dumbbell.

Videos load only when the user selects Load video demonstration. The app uses YouTube's unmodified privacy-enhanced player, passes a Referer, preserves controls and attribution, and provides Watch on YouTube. There is no autoplay, downloaded video, media extraction, rehosting or service-worker caching of third-party video. The player needs the internet. Captions depend on what the video provider supplies. Embedding permission and video availability can change. Missing video coverage does not substitute a different exercise or equipment variation.

src/movement-rig.js contains the proportion and limb constraints. src/model.js contains the authored motion and viewer. src/movement-sources.js holds reference and embedding records. src/video-demonstration.jsx handles the optional player. tests/movement-models.test.mjs adds geometry, contact, side and embed checks. All 50 automated checks pass.

The official embedding guidance is https://support.google.com/youtube/answer/171780?hl=en and the platform terms are https://www.youtube.com/t/terms. Native provider playback, including any ads, remains under the provider's control. We did not acquire downloadable media rights or use MoveKit assets.
