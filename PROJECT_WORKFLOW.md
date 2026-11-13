# Ocean Birds redesign workflow

## 工作目錄與授權

- 專案唯一工作目錄為 `C:\Users\Administrator\Downloads\Ocean_Birds`；之後直接在此目錄修改，不另開副本或工作資料夾。
- 若工作階段沒有該目錄的讀寫權限，先向使用者提示並取得授權，再開始讀寫；不得改在 Codex 目錄另做一份。

## Goals

1. Modernize the layout and typography so the site feels polished, calm, and easy to read.
2. Make the bird guide data-driven so new species can be added without rewriting page layouts or navigation.

## Visual direction (updated from `code_artifact.html`)

Use a presentation-like, full-viewport layout: one scene per screen with no page scrollbar, keyboard/touch navigation between scenes, and purposeful transitions. Use LXGW WenKai Mono TC throughout, with a 17px base and a 15px minimum font size, a polished high-contrast palette, a restrained animated backdrop, and light motion on featured objects. Keep motion short and readable, honor reduced-motion settings, and make every screen fit common desktop and mobile viewports. Long bird stories should become navigable screens rather than compressed into one viewport.

## Working rules

- Keep the active site and all changes in the original project folder; do not create a working copy.
- Keep archived SWF sources, Flash Player, extracted decode output, superseded styles, and unused assets under `Backup/`. The folder is ignored by Git in `.gitignore`; active pages must not reference archived files.
- The original SWFs and their extraction tools remain available under `Backup/flash-archive/` as a local reference baseline.
- Keep the site static and dependency-light unless implementation work proves a build system is needed.
- Separate visual components from bird content data; keep the original SWF frame mapping as reference metadata.
- Complete one phase and review its visible result before moving to the next.

## Phases and review gates

### 0. Baseline and content inventory

**Status:** completed. The existing 22 species, 8 families, 160 photo/story slides, six home sections, movie, games, quiz, and original SWF frame viewer are preserved in the redesign worktree.

- Record the current routes, page functions, source assets, and interactions that must survive.
- Capture desktop and mobile reference views before layout changes.
- Confirm the bird data fields and media relationships already recovered from the SWF.

**Review gate:** a page-by-page preservation checklist and an agreed visual direction.

### 1. Design system and shared shell

**Status:** shared full-screen shell is implemented across the main routes. `site.css`, `presentation-pages.css`, and `presentation.js` provide scene sizing, keyboard/touch controls, transitions, reduced-motion support, and route-specific scene navigation.

- Define reusable color, typography, spacing, radius, shadow, and breakpoint tokens with CSS custom properties.
- Build the shared site header, navigation, page container, and responsive content widths.
- Set accessibility defaults for focus states, contrast, semantic landmarks, and reduced motion.

**Review gate:** the shared shell looks consistent at desktop and mobile sizes before individual pages are migrated.

### 2. Page layout modernization

**Status:** first-pass full-screen layouts are in place for the home, bird guide, Keelung birds, guide, movie/story, quiz, and games. The pages share an image-left, right-panel full-screen layout with a 7% diagonal edge. The home page is a single cover without a scene counter, and each theme has a forward link in this route: home → guide → bird catalog → Keelung birds → coastal ecology story → games → quiz.

- Redesign the home page and section landing pages using the shared shell and reusable cards.
- Reflow the bird guide, Keelung birds, movie/story page, guide, and games to fit the new reading layout.
- Preserve existing content, image/dialogue sequencing, page links, and game interactions.

**Review gate:** every existing page is reachable and its core content and controls still work.

### 3. Extensible bird catalog

**Status:** first pass implemented. `bird-catalog.js` holds family/species records; `bird-slides.js` holds each species' ordered photo and dialogue slides; `birds.js` renders the catalog and slideshow. The `id` value maps the cover image to its extracted bitmap.

- Move species and family information into a structured catalog, separate from rendering code.
- Use a consistent species record with a stable slug, common name, family, optional scientific name and facts, plus an ordered list of photo/dialogue entries.
- Render family listings, species navigation, photo counters, and detail pages from the catalog.
- Migrate the recovered 22 species without changing their existing order or dialogue; keep SWF frame and bitmap IDs as optional provenance fields.
- Document the add-a-bird process so adding a species means adding its data and media, not editing page logic.

**Review gate:** the current catalog matches the restored content, and a sample new species can be added through data only.

### 4. Quality and handoff

**Status:** desktop screens have been reviewed and responsive CSS refined. The bird guide's family chooser, species detail, and synchronized photo/dialogue change were checked in the browser. It now loads the higher-quality JPEGs in `assets/` directly; the available bird photos are 640×426, so larger source images would be needed for more real detail. Mobile viewport review and complete game-flow checks remain.

- Check the full route flow, image/audio/video loading, slideshow boundaries, and game controls.
- Review desktop, tablet, and mobile layouts, keyboard navigation, text contrast, and long dialogue behavior.
- Compare key screens against the restoration baseline to ensure the redesign changes presentation without losing content.
- Update project documentation with the design tokens, catalog schema, and steps for adding a bird.

**Review gate:** preservation checklist complete, no broken local assets, and the extension guide is sufficient for adding another species.

## Suggested implementation order

1. Approve the visual direction and content checklist.
2. Create the shared layout and design tokens.
3. Modernize the home and bird guide as the first full-screen scene implementations.
4. Review and tune the shared scene components, then migrate the remaining pages.
5. Migrate the remaining pages.
6. Refactor the bird guide into catalog-driven rendering and verify adding a sample species.
7. Complete responsive and interaction review, then update documentation.

## Add a species

1. Add the species to its family array in `bird-catalog.js`, with `name` and the extracted cover bitmap `id`.
2. Add that species' ordered photo and dialogue records to `bird-slides.js` under the exact same name. Each slide uses its extracted `image` ID and original `text`.
3. Put the JPEG in the corresponding unit folder under `assets/` and name it for the bird or image subject. Update that unit's `image-map.js` so the new page points to the file; keep the `assets/` root free of loose files.

The gallery, family filters, photo navigation, counter, and autoplay are generated from these records. Rendering code does not need a per-species edit.
