# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kulturkompasset backend — a **Sanity Studio v5** project for a cultural events/news platform (Norwegian language). This is a content management studio, not a traditional backend API.

## Commands

- `npm run dev` — Start dev studio at http://localhost:3333
- `npm run build` — Production build (output to `dist/`)
- `npm run deploy` — Deploy studio to Sanity hosting
- `npx sanity graphql deploy` — Deploy GraphQL API
- `npx eslint .` — Lint (uses `@sanity/eslint-config-studio`)

No test framework is configured.

## Environment Variables

- `SANITY_STUDIO_PROJECT_ID` — Sanity project ID
- `SANITY_STUDIO_DATASET` — Dataset name (defaults to `production`)
- `SANITY_STUDIO_STUDIO_HOST` — Studio hostname for deployment

## Architecture

### Schema Types (`schemaTypes/`)

All Sanity schemas, registered in `schemaTypes/index.ts` and consumed by `sanity.config.ts`.

- **Documents** (`schemaTypes/documents/`): `article`, `event`, `bulletin`, `bulletinSubmission`, `category`, `contributor`, `venue`, `partner`, `playlist`, `siteSettings`, `sponsor`, `news`
- **Objects** (`schemaTypes/objects/`): Reusable types — `cta`, `seo`, and page builder blocks
- **Page Builder** (`schemaTypes/objects/pageBuilder/`): Modular content blocks used in article's `pageBuilder` array field (hero, lead, text, image, gallery, video, embed, blockquote, divider, image+text layouts)

### Singleton Pattern

`siteSettings` is a singleton document (fixed ID `site-settings`). The config filters out the `duplicate` action and creation template for singleton types.

### Studio Customizations (`studio/`)

- **`dashboardPane.tsx`** — Custom dashboard with content statistics and health checks, shown as first item in the desk structure
- **`articlePagePreviewPane.tsx`** — Live preview pane for articles (shown alongside the form editor)
- **`approveBulletinSubmissionAction.tsx`** — Custom document action on `bulletinSubmission`: approves a submission by creating a `bulletin` document and deleting the submission in a single transaction
- **`defaultStructureRedirectLayout.tsx`** — Redirects the default Studio route to the dashboard
- **`guidePanes.tsx`** — Renders markdown docs from `docs/` inside the Studio

### Desk Structure (`sanity.structure.ts`)

Custom desk layout: Dashboard > Guides > Site Settings > Articles (with preview) > Bulletin Submissions > Bulletins > remaining document types.

### Bulletin Submission Flow

External submissions (`bulletinSubmission`) are reviewed in Studio. The custom "Godkjenn" action creates a `bulletin` from the submission data (auto-generating a slug) and deletes the submission atomically.

## Code Style

- Prettier: no semicolons, single quotes, no bracket spacing, 100 char width
- TypeScript strict mode
- All UI text and field descriptions are in Norwegian (Bokmål)
