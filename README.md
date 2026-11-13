# Home training

A personal workout planner for home, gym and running. Choose a goal, the equipment you have and the time you can make. The app drafts a schedule, explains each movement and keeps a record of your sessions.

[Open the app](https://home-training-7f3a.belcoda-foun-1669.chatgpt.site)

## What it does

- Plans strength, muscle-building, general fitness and running sessions around your available time and equipment.
- Supports home workouts, gym sessions and mixed weeks.
- Includes 27 original, rotatable 3D movement guides with form cues and explanations.
- Links each movement to professional guidance and offers eight optional NASM video demonstrations.
- Records sets, loads and effort, with lighter-session previews and suggestions based on your recorded results.
- Supports offline use after setup, calendar export, and backup and restore.
- Offers three colour palettes, with Forest and Ivory as the default, plus light and dark appearances.

Your profile, schedule and workout records stay in the current browser. There are no accounts or automatic cross-device syncing. Export a backup before moving to another browser or device.

## Run locally

Install Node.js and npm, then clone the repository and install its dependencies.

```sh
git clone https://github.com/kennlebu/home-training.git
cd home-training
npm ci
npm run dev
```

Open the local address printed by Vite.

Run the checks and create a production build with the following commands.

```sh
npm test
npm run typecheck
npm run build
```

The production files are written to `dist`. Use `npm run preview` to inspect that build locally. Installation and offline features require HTTPS or localhost. Opening the HTML file directly from disk does not provide the full app experience.

## Movement guidance and offline use

The figures are original, simplified human illustrations. They explain movement and do not measure or assess your form. All 27 have a recorded comparison with specific professional references. Independent trainer review is still pending.

The [movement review](movement-review.json) records the sources, changes and equipment differences. Optional videos use the original YouTube player and need an internet connection. Videos are not downloaded or included in the offline cache.

Wait until the app reports that it is ready offline before relying on it without a connection. External references still need the internet. Browser storage can be cleared or evicted, so keep backups of records you want to retain. Physical iPhone and Android installation and performance remain unverified.

## Project files

The interface uses React, customised shadcn/ui components and Vite. Workout planning, saved records and the original human movement guides are in `src`. Automated checks are in `tests`.

[Development notes](README.txt) describe the app structure, previous browser checks and current limitations. [Third-party notices](THIRD_PARTY_NOTICES.txt) preserve the licences and attribution for components, fonts and linked media.

The existing deployment identity is recorded in `.openai/hosting.json`. Keep it when working on this hosted app. Use your own hosting configuration for a separate deployment. Personal workout records and credentials do not belong in this repository.

## License

Copyright 2026 Kenneth Lebu.

The original project code is free software under the GNU General Public License, version 3 or any later version. See [LICENSE](LICENSE) for the full terms, including the warranty disclaimer.

Third-party components, bundled fonts and external media retain their own licences and terms, as recorded in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).
