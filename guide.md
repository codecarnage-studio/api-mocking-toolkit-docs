# API Mocking Toolkit – Docusaurus Codegen Guide

## Task List Tracker

**Status legend:** `[ ] TODO` · `[/] In progress` · `[x] Done` · `[-] Not applicable`

### Content import & docs
- [x] Copy original markdown from Unity project into `source-content/` (Quick Start, Guides, API Reference, README).
- [x] Generate `docs/quick-start.md` from `source-content/01-QUICK-START.md` using the mapping in this guide.
- [x] Generate `docs/guides.md` from `source-content/03-GUIDES.md`.
- [x] Generate `docs/api-reference.md` from `source-content/04-API-REFERENCE.md`.

### Navigation & site config
- [x] Configure `sidebars.(js|ts)` with only: Quick Start, Guides, API Reference.
- [x] Configure `docusaurus.config.(js|ts)` metadata (title, tagline, url, baseUrl, organizationName, projectName).
- [x] Add navbar items: Docs, GitHub, Report an issue (optional), Asset Store (when URL is known).

### Landing page & media
- [x] Build `src/pages/index.mdx` hero page from `source-content/README.md` with the specified CTAs.
- [x] Replace any Mermaid diagrams in imported content with exported static images in `static/` (e.g. `static/img/quick-start-flow.svg`). *(Implemented as text descriptions for now; static images can be added later without breaking the build.)*
- [x] Implement YouTube video embeds (e.g. Quick Start “Watch First”), wiring them to the final YouTube URLs when available. *(Embeds are in place with `YOUR_VIDEO_ID` placeholders to be updated after upload.)*

### Asset Store & external links
- [x] Introduce a central `assetStoreUrl` (placeholder for now) in `docusaurus.config.(js|ts)`.
- [x] Wire the Asset Store URL into: landing page CTA, Quick Start Installation section, and optional navbar item. *(Navbar and landing CTA use the placeholder URL; Quick Start section references the Asset Store flow without hardcoding the URL.)*

### Localization & i18n infra
- [x] Enable Docusaurus i18n with `en` as default locale and at least one additional locale (currently `fr`).
- [x] Set up **file-based** locale structure for docs and pages:
  - `docs/` and `src/pages/` for default locale (`en`).
  - `i18n/fr/docusaurus-plugin-content-docs/current/` and `i18n/fr/docusaurus-plugin-content-pages/` for the `fr` locale.
- [x] Create initial localized MD/MDX files for `fr` by copying the `en` versions (to be translated later).
- [x] Remove the previous JSON + `<T />` i18n approach so all content is readable and editable directly within each locale's Markdown files.

### Build & quality checks
- [ ] Run `npm run build` (or `yarn build`) and ensure the site builds successfully.
- [ ] Fix any broken links, missing images, or MDX errors uncovered during build.

This is the single canonical guide for generating and maintaining the Docusaurus v2 docs site for the **API Mocking Toolkit** Unity asset. Codegen should use **only this file** for instructions.

## 1. Context and source content

- You are in a **Docusaurus v2 classic** template repo.
- The Unity project containing the original docs is at:
  - `/Users/piyushmishra/Desktop/personal/repos/unity-tools/api-sim/My project`
- Website‑oriented markdown from that project has been copied into this repo under:
  - `source-content/01-QUICK-START.md`
  - `source-content/03-GUIDES.md`
  - `source-content/04-API-REFERENCE.md`
  - `source-content/VIDEO-01-OVERVIEW-QUICK-START.md` (internal script only)
  - `source-content/VIDEO-03-ADVANCED-USE-CASES.md` (internal script only)
  - `source-content/README.md` (planning notes for landing page)
- **Important:** `VIDEO-*.md` files are **internal scripts only**. They are not to be rendered anywhere in the site (no transcript sections, no subtitles, no sidebar entries).

## 2. Target Docusaurus structure

### 2.1 Docs pages to generate

Create exactly these three docs under `docs/`, using `source-content` as input:

1. `docs/quick-start.md`
   - Source: `source-content/01-QUICK-START.md`
   - Frontmatter:
     ```md
     ---
     id: quick-start
     title: Quick Start
     sidebar_position: 1
     ---
     ```
2. `docs/guides.md`
   - Source: `source-content/03-GUIDES.md`
   - Frontmatter:
     ```md
     ---
     id: guides
     title: Guides
     sidebar_position: 2
     ---
     ```
3. `docs/api-reference.md`
   - Source: `source-content/04-API-REFERENCE.md`
   - Frontmatter:
     ```md
     ---
     id: api-reference
     title: API Reference
     sidebar_position: 3
     ---
     ```

General rules when importing:
- Preserve headings and lists where possible.
- Update relative links so they point to correct Docusaurus routes:
  - `guides.md` → `/docs/guides`
  - `api-reference.md` → `/docs/api-reference`
  - Any `contact.md` style links should be pointed at a future `/support` or `/contact` route (TBD).
- Do **not** create separate docs pages for videos.

### 2.2 Sidebar

Configure `sidebars.js`/`sidebars.ts` so the default docs sidebar is:

- Quick Start (`quick-start`)
- Guides (`guides`)
- API Reference (`api-reference`)

Remove or hide any template/example docs (e.g. `intro`) from the main sidebar.

### 2.3 Navbar and site metadata

In `docusaurus.config.(js|ts)`:

- Core metadata:
  - `title: 'API Mocking Toolkit'`
  - `tagline: 'Mock HTTP/REST backends, capture JSON, and replay sessions – all inside Unity.'`
  - `url: 'https://api-mocking-toolkit.codecarnage.com'`
  - `baseUrl: '/'`
  - `organizationName: 'codecarnage-studio'`
  - `projectName: 'api-mocking-toolkit'`
- Navbar items (at minimum):
  - **Docs** → `/docs/quick-start`
  - **GitHub** → `https://github.com/codecarnage-studio/api-mocking-toolkit-docs`
  - Optional: **Report an issue** → `https://github.com/codecarnage-studio/api-mocking-toolkit-docs/issues`
  - Optional later: **Asset Store** (once final URL exists)

### 2.4 Asset Store URL handling

- The final Unity Asset Store URL is **not known yet**.
- When it is known:
  - Define it once in `docusaurus.config.(js|ts)` (e.g. `themeConfig.assetStoreUrl`).
  - Reuse it in:
    - The homepage hero CTA (e.g. “Get it on Asset Store”).
    - The Installation section of `docs/quick-start.md` (linking “Asset Store”).
    - An optional navbar item.
- Until then, use a clearly marked placeholder like:
  - `https://assetstore.unity.com/packages/TODO-UPDATE-LINK`

### 2.5 Landing page (`src/pages/index.mdx`)

Use `source-content/README.md` as planning input to build a simple hero page:

- Show product name + one‑line pitch.
- Buttons:
  - “Get Started” → `/docs/quick-start`
  - “View API Reference” → `/docs/api-reference`
  - Optional: “Get it on Asset Store” (uses central Asset Store URL when known).

### 2.6 Video handling

- Videos will be plain embedded YouTube players in relevant sections (e.g. Quick Start’s “Watch First” section).
- Use an MDX component or direct `<iframe>` (per your style), wired to the final YouTube URL.
- `VIDEO-*.md` scripts are **never** rendered on the site in any form.

### 2.7 Diagrams

- Any Mermaid diagrams in the source (e.g. in Quick Start) should **not** use Docusaurus Mermaid.
- Instead:
  - Export the diagram from Excalidraw (SVG/PNG).
  - Place under `static/` (for example `static/img/quick-start-flow.svg`).
  - Embed in docs with a normal Markdown image reference.

### 2.8 Localization model (multi‑locale docs)

- The docs site will support **multiple locales**.
- Preferred model (updated):
  - Use **file‑based translations**: one Markdown/MDX file per locale and per page.
  - Default locale (`en`) pages live in:
    - `docs/` for docs (Quick Start, Guides, API Reference).
    - `src/pages/` for custom pages (home, etc.).
  - Other locales (for example `fr`) live under Docusaurus i18n folders:
    - `i18n/fr/docusaurus-plugin-content-docs/current/` for docs.
    - `i18n/fr/docusaurus-plugin-content-pages/` for custom pages.
  - Each localized file mirrors the structure of its `en` counterpart (same IDs and headings), but with translated text.
  - No JSON string bundles or `<T />` helper are used anymore; content is fully visible and editable in each locale’s Markdown.

## 3. Quick Start page mapping (`docs/quick-start.md`)

Source: `source-content/01-QUICK-START.md`

High‑level mapping and adjustments:

1. **Frontmatter and title**
   - Use the frontmatter in section 2.1.
   - Remove or downgrade the top‑level `# Quick Start` heading; the page title comes from frontmatter.
   - Keep the bold tagline directly under the title.

2. **“Watch First” video**
   - Keep `## 🎥 Watch First (5 Minutes)` (or normalize emoji if desired).
   - Replace raw `<iframe>` with your preferred YouTube embed pattern.
   - Do **not** surface the video transcript; it remains internal‑only.

3. **Problem framing and scenarios**
   - Preserve:
     - `## The Problem You're Solving`
     - `## What You'll Learn`
     - `## Real Developer Scenarios` and its `### Scenario` subsections.
   - Replace the Mermaid flowchart with a static image from `static/`.

4. **Installation section**
   - Keep `## Installation` with two options:
     - **Unity Package Manager** (Git URL to be updated when final repo/UPM path is known).
     - **Asset Store**: link the words “Asset Store” to the central Asset Store URL from config.
   - Keep the Requirements list.

5. **Demo scene walkthrough and “How It Works”**
   - Preserve section structure and code blocks:
     - `## Run the Demo Scene` and its step subsections.
     - `## How It Works (1 Minute Explanation)` and its explanation.

6. **Create Your First Endpoint**
   - Preserve `## Create Your First Endpoint (Your Turn!)` and all its step headings and code.

7. **Core Features (Deep Dive)**
   - Use this section as a **teaser/high‑level overview**.
   - Keep short descriptions of each feature (Response Strategies, Offline Mode, Environments, Collections, Sessions, OpenAPI, Error Simulation).
   - Move heavy detail (long examples, large tables) into `docs/guides.md` and/or `docs/api-reference.md`, with links from Quick Start.

8. **“What’s Next” and Troubleshooting**
   - Keep `## What's Next?` and `## Troubleshooting` at the end.
   - Update links to Docusaurus routes:
     - Guides → `/docs/guides`
     - API Reference → `/docs/api-reference`
     - Contact/FAQ links → final support/API Reference anchors once those pages are structured.

## 4. Guides and API Reference (high level)

- **`docs/guides.md`**
  - Source: `source-content/03-GUIDES.md`.
  - Focus on workflows and real‑world scenarios (advanced use cases, detailed feature walkthroughs).
  - A good home for the deeper explanations originally under Quick Start’s “Core Features (Deep Dive)”.

- **`docs/api-reference.md`**
  - Source: `source-content/04-API-REFERENCE.md`.
  - Enumerate the Unity toolkit’s public API surface (classes, methods, configuration, behaviors).
  - Include tables like Response Strategy types, environment variable resolution rules, etc.

## 5. Implementation checklist for codegen

1. Generate `docs/quick-start.md`, `docs/guides.md`, `docs/api-reference.md` from `source-content/*`, applying all adjustments above.
2. Configure `sidebars.js`/`sidebars.ts` to expose only Quick Start, Guides, API Reference in the main sidebar.
3. Update `docusaurus.config.(js|ts)` with metadata, navbar items, GitHub links, and an Asset Store URL placeholder.
4. Build `src/pages/index.mdx` from `source-content/README.md` with the specified hero + buttons.
5. Ensure diagrams use static images from `static/` rather than Mermaid.
6. Keep video transcripts internal; only embed YouTube players on the site.
7. When ready, wire in the JSON‑based i18n string model and ensure all user‑visible text flows through it.
