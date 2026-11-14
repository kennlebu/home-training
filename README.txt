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

movement-review.json records the scope precisely. All 27 movements passed the geometry checks. All 27 movements now have a specific professional reference comparison. Sources include NASM, ACE, NHS, AAOS, NSCA, Mayo Clinic, BarBend and Catalyst Athletics. None has independent trainer approval. Source guidance was used to author our own illustrative motion. No third-party animation, photograph or video was copied into the app.

Eight exercises have videos linked from NASM's own exercise pages and returned as embeddable by YouTube oEmbed on 12 November 2026. Each returned the matching title and the official NASM channel. The exercises are goblet squat, dumbbell Romanian deadlift, floor bridge, dead bug, bird dog, plank, push-up and side plank. The goblet video shows a kettlebell, which is disclosed next to the player because our illustration uses a dumbbell.

Videos load only when the user selects Load video demonstration. The app uses YouTube's unmodified privacy-enhanced player, passes a Referer, preserves controls and attribution, and provides Watch on YouTube. There is no autoplay, downloaded video, media extraction, rehosting or service-worker caching of third-party video. The player needs the internet. Captions depend on what the video provider supplies. Embedding permission and video availability can change. Missing video coverage does not substitute a different exercise or equipment variation.

src/movement-rig.js contains the proportion and limb constraints. src/model.js contains the authored motion and viewer. src/movement-sources.js holds reference and embedding records. src/video-demonstration.jsx handles the optional player. tests/movement-models.test.mjs adds geometry, contact, side and embed checks. The current check count and browser results are recorded below.

The official embedding guidance is https://support.google.com/youtube/answer/171780?hl=en and the platform terms are https://www.youtube.com/t/terms. Native provider playback, including any ads, remains under the provider's control. We did not acquire downloadable media rights or use MoveKit assets.

Remaining movement review and human figures

Version 2.4 checks the remaining 16 movements against specific source instructions. Twelve receive motion, support or equipment corrections. Four retain their existing motion after comparison. The record identifies the exact source, the mechanics compared, the changes and any equipment variation. The source link and variation note appear in the movement guide. What we checked expands the three comparison points and the outcome. Source programmes, clinical advice and pain-related claims are not adopted. None of the organisations or authors has reviewed or endorsed the app. Independent trainer review remains pending.

Changes include knee and toe direction for the squat, moving the bridge band above the knees, starting dumbbell rows below the shoulders, floor contact for floor press elbows, a straight body line in wall presses, visible calf-raise wall support with planted forefeet, straight rollout arms and wheel contact, a lower front pulldown bar path with a thigh pad, a supported leg press with an aligned platform and bent knees at extension, a barbell starting in front of the thighs and bent opposing arms when marching. Press, curl and cable-row wording is clearer. Four existing motion paths remain after comparison, namely standing band row, overhead press, cable row and curl. Supine body and head heights also fit the fuller figure to the floor or bench support.

src/human-model.js builds an original stylised human figure around the authored skeleton. It adds a shaped shirt and shorts, tapered upper arms and forearms, thighs and calves, palms and thumbs, shoes, a neck, head, short hair and small facial landmarks. Surfaces use directional shading and follow camera rotation. Body surfaces stop at the floor, and the camera checks include the fuller figure and the full bar and platform. Clothing follows the selected palette. The figure is an illustration, not captured biomechanics or a personalised body model. No external mesh, photograph, motion capture or animation is included.

scripts/update-movement-review.mjs regenerates movement-review.json from the exercise and reference records. The eight existing optional NASM video demonstrations remain available under the existing provider-player policy. This release adds reference links, not downloaded or newly licensed media.

Validation for version 2.4

All 59 automated checks pass, along with the type check and production build. The movement checks cover the fixed skeleton, both sides, planted wall-press hands and feet, calf forefoot pivots, floor-press elbow contact, straight rollout arms, supported leg-press travel, row and pulldown paths, marching arm coordination, human facing direction, and phone framing for the fuller body and equipment.

The production preview was checked in the browser for the human standing press, floor-press depth and head support, rollout head direction and wheel contact, leg-press support, calf-raise wall contact, expanded source comparison details, and front and side controls. Dialogs and the page had no horizontal overflow at 320, 390 and 1280 pixels. No browser warnings or errors were recorded in the checked preview. Saved desktop and phone screenshots accompany the source record. Physical phone performance and installation remain unverified.

Forest studio

Version 2.5 applies the Forest studio direction chosen by the user. The overview places the next real session and its prescription beside the original rotatable movement guide. Selecting a movement previews its illustration without modifying the workout. The Start session action retains the existing review and warm-up guidance. Upcoming sessions appear as plain rows, followed by actual recorded totals and plan details. The weekly summary is bounded to the current calendar week.

The shared interface now uses a quiet desktop top bar, phone navigation, normal-case labels, larger readable form text, thin rules and a single soft surface for the movement guide. Setup, schedule, exercise library, training review, recording, running, video demonstrations, backups and device controls retain their existing actions. Forest and Ivory remains the default and all saved palette and appearance choices remain supported.

DESIGN.md records the selected system. src/studio.css applies it over the existing shadcn components. src/studio-overview.js renders the actual schedule and history for the overview, with no stored-state writes. Its checks cover movement selection, truthful totals, week boundaries, running and completed blocks, escaping and active-session actions. All 64 automated checks pass, along with the type check.

Forest studio browser checks passed for plan creation, selecting and rotating an overview movement, the session review and warm-up, recording a set, leaving and resuming it, saving a partial session and restoring it after reload. Ink and Mint dark mode and Forest and Ivory light mode kept their saved state. At 320 and 390 pixels, the overview, setup, schedule, progress and movement dialog stayed within the page. The 1280 pixel overview uses the selected two-column layout. The app update reopened successfully, then reopened again with the preview server stopped, retaining its fonts, movement guide, palette and recorded set. Physical phone installation remains unverified.
