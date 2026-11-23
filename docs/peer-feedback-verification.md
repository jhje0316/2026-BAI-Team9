# Peer feedback verification

This report records verification of the original peer-feedback revision. See the [current demo README](../README.md) for commands and URLs for the combined presentation.

## Story and tested scope

A reviewer opens `AJOU-SYN-001`, reads the simulated risk explanation, reviews the evidence, selects report claims, inspects the same draft in the package, and records a reasoned Hold decision. The log preserves the exact decision snapshot. Gemini responses cannot change the deterministic workflow.

Verification date: 2026-11-23, Asia/Seoul. Baseline source revision: `c080767e95a0699c4afdb030938977cd6fc020ba`.

## Type check

`npm run lint` runs `tsc --noEmit` and passed.

## Build

`npm run build` passed with Vite. `vite.config.ts` now uses `import.meta.dirname`, resolving the original future-config warning. The unused direct esbuild dependency was removed after `npm install` exposed an incompatible optional peer range with Vite. `package-lock.json` records the installed tree. Installation reported zero known vulnerabilities at that time; this is not a security audit.

## Domain and API tests

`npm test` passed **19 tests**, using Node's test runner through tsx. Existing tests were retained and adjusted where the intended behavior changed.

The tests cover:

- `001` remains HIGH with three signals and recommends verification.
- `0.42` belongs to simulated CV evidence.
- Exact price and similarity boundaries, two-signal behavior and bilingual rubric constants agree.
- Every deselected item's facts, indicators and item-specific uncertainty disappear from the generated draft.
- Empty selections and unreviewed evidence cannot enter the draft.
- Review, selection, explicit confirmation, rationale and an exact canonical draft are required for a decision.
- Synthetic review never unlocks takedown approval; missing metadata continues to block it.
- Lawful resale context stays LOW; grey-market context recommends verification.
- Audit records preserve the recommendation, decision, selected IDs, review and verification states, rationale, override, full timestamp and exact draft version.
- Hostile Gemini approval and draft fields cannot enter report or approval state.
- Real local Express HTTP requests reject malformed listings and model responses, strip extra draft/control fields and sanitize provider errors.

API tests inject a deterministic provider response at the Gemini boundary. They exercise the real Express route and HTTP transport. They do not establish that the external Gemini service works.

## Browser tests

`npm run test:e2e` passed **7 tests**, using installed Google Chrome in headless mode through Playwright.

| Test | Observed result |
| --- | --- |
| English full workflow | HIGH case, score explanation, rubric, no preselected evidence, review gates, price exclusion, package consistency, rationale, Hold and snapshot worked. Evidence changes reset confirmation and preserve the old snapshot. |
| Korean full workflow | Equivalent labels and behavior worked, including the recorded decision. |
| Missing mandatory metadata | Incomplete case locked approval. Completing synthetic fields passed the metadata check but did not authenticate evidence or unlock takedown. |
| Resale case | LOW classification and context appeared. Reviewed selection, confirmation and rationale enabled dismissal. |
| Hostile Gemini response | A routed test response recommending approval stayed in the untrusted comparison. HIGH baseline and approval lock stayed intact. Its text did not enter the report. |
| Invalid Gemini response | Client displayed an error and kept the baseline and gates. |
| Mobile at 390 × 844 | Evidence review rendered and the page had no horizontal overflow. |

The English and Korean full workflow tests also checked for uncaught page errors. Actual full-page screenshots are saved under `docs/screenshots`. These are developer verification runs, not peer usability tests.

## Actual running server

`npm run dev` served the improved app at `http://localhost:3000`. The actual `/api/health` response was:

```json
{"status":"ok","geminiConfigured":false}
```

The deterministic UI and browser workflow worked against this server. `NODE_ENV=production PORT=3002 npm start` was also smoke-tested: health returned HTTP 200, Chrome rendered the simulation explanation, and the takedown button was disabled. No Gemini key was configured. External Gemini authentication, model availability, response quality, latency and retries were not verified against the live provider. API and client error handling, shape validation and gate isolation were tested locally.

## Failures corrected during this task

- Initial dependency installation failed because the original direct esbuild version conflicted with Vite's optional peer requirement. No source imported esbuild, so the unused direct dependency was removed and installation succeeded.
- One existing resale test assumed a specific bullet position. It was updated to assert the actual resale explanation rather than presentation order.
- The first browser run passed five tests and failed the page-error assertions in the two full workflows. The restored original dev server occupied Vite's default HMR port, producing `WebSocket closed without opened.` The original server was stopped and the improved server restarted. All seven tests then passed with no uncaught page errors in the full workflows.

## Presentation checks

`peer-feedback-presentation-en.md` contains six timed sections. Its spoken paragraphs contain 642 whitespace-separated words, excluding headings and bracketed demo cues. The repeatable verification script enforces 600–700 words and the presence of all required documents and screenshots. `peer-feedback-presentation-ko.md` translates the complete script and adds speaker notes and the same click sequence. Timing is a rehearsal target, not a measured live performance.

## Limits

All listing, catalog, seller and trademark records are synthetic. CV values are manually assigned. The images are SVG illustrations. No real-world precision, recall, acceptance rate, time savings or post-change peer test was measured. All actual takedown approvals remain unavailable because no independent evidence intake exists. Logs are kept in React state and disappear on refresh. No marketplace collection or submission occurred. Tests do not cover a real authentication or multi-user deployment.

## Repeat the checks and run the app

From the repository root, with Node.js 24 and Google Chrome installed:

```sh
npm ci
node scripts/verify-peer-feedback.mjs
npm run dev
```

Open `http://localhost:3000`. The full verification script runs type checks, domain/API tests, build and browser tests. Playwright starts a dev server if one is not already available. On systems without Google Chrome, install it or change `channel` in `playwright.config.ts` to an installed Playwright browser.

For the production build served by Express:

```sh
npm run build
NODE_ENV=production npm start
```

`npm run preview` previews only Vite's static output and does not serve the Express API. An optional Gemini experiment requires a valid server-only `GEMINI_API_KEY` in the environment or `.env`; use `.env.example` as the reference. Never prefix it with `VITE_`. The required deterministic demonstration works without a key.
