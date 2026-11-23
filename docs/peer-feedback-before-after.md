# Peer feedback: before and after

## Baseline and actual feedback

The clean starting revision was `c080767e95a0699c4afdb030938977cd6fc020ba`. The baseline below was recorded from its source before application edits. The original source was also restored in `/tmp/ajou-peer-before`, run with the installed dependencies on port 3001, and captured as [before-en.png](screenshots/before-en.png). This is an actual browser screenshot of that restored source, not a fabricated mockup.

Another group reviewed Spanish case `AJOU-SYN-001`. They found the comparison useful and the human workflow understandable. They asked for context for `0.42`, an explanation of the final risk rating, less definitive report wording, recognition of lawful resale, and direct control over the evidence included in a draft. No new peer test or quantitative business result is claimed.

## Implemented comparison

| Area | Previously implemented at the starting revision | Changed in this task |
| --- | --- | --- |
| CV similarity explanation | SVG comparison, `0.42 CV Match`, image-quality limitation, global simulation caveats and blind-score toggle. No nearby scale or probability explanation. | Nearby explanation identifies an assigned 0–1 simulation input. Lower means lower illustrative similarity. Not measured production CV or a counterfeit probability. Both SVG images are labeled illustrations. |
| Risk classification rationale | UI said HIGH required two signals. Code used replica wording OR price <= -60% with CV < 0.75 OR CV < 0.65. High risk recommended takedown approval. | Shared constants drive code and bilingual rubric. After metadata and seller/resale checks, HIGH requires two of three signals. `001` has all three and remains HIGH. Its recommendation is Hold for Verification. |
| Evidence verification | Four read-only comparison checks. No selection or reviewer verification state. | Six item reviews, actual values, provenance, kind, simulation label, uncertainty disclosure, explicit include/exclude controls. Nothing preselected. Optional Gemini interpretation is separately labeled and cannot enter reports. Reviewed synthetic data remains unverified. |
| Report wording | `001` said "unlawfully references", "unauthorized goods", "visual inspection confirms" and requested immediate removal. Fictional rights presented as confirmed. | Read-only canonical investigation draft separates facts, indicators, unverified assumptions, requested checks and next steps. Each claim uses only selected, reviewed, available evidence. Package and clipboard use the same text. No extra rights or price sheet is added behind the selection controls. |
| Human approval controls | Mandatory metadata lock, inline completion, editable draft, optional note, approve/hold/dismiss. No evidence confirmation or required rationale. | Review every item, select at least one available item, confirm selections and enter a nonblank rationale before Hold or Dismiss. Evidence changes clear confirmation. No independent evidence intake exists, so takedown approval stays locked even when sample Active metadata is complete. App-level validation repeats the decision gate. A new Gemini analysis resets unsaved evidence review. |
| Audit traceability | Session-only case, product, AI classification, action, driver, override flag, optional note, time of day. Preview falsely stated approval was recorded. | Full ISO timestamp, AI recommendation, selected IDs, every evidence review and verification state, rationale, override flag and versioned exact draft snapshot. Expand the record to inspect it. Preview states that it is not approval. Logs remain session-only. |

## Risk logic and deliberate rule change

`RISK_THRESHOLDS` and `getRiskRubric` in `src/domain/triageRules.ts` are the shared source of the visible thresholds.

The order is:

1. Missing SKU, seller ID/status, valid UTC timestamp or Active sample trademark status gives `HOLD_MISSING_DATA`.
2. A sample whitelisted seller gives LOW. Alternatively, resale cues plus no replica wording and simulated similarity >= 0.80 give LOW.
3. Otherwise, count replica wording, New condition with rounded price deviation <= -60%, and simulated similarity < 0.65. At least two gives HIGH. Every other case gives MEDIUM.

Unlisted status is context, not an infringement signal. The LOW whitelist/resale branches are preserved as demonstration assumptions, not authentication. A genuine pilot would need to validate those assumptions too.

The old OR rule and the weaker `price <= -60% AND CV < 0.75` shortcut were removed to implement the previously stated two-signal policy. The New condition qualifier is now enforced. The discount boundary is explicitly **inclusive -60%**, matching the original calculation check rather than the original UI's inconsistent “more than 60%” wording. The displayed rule says that it uses a rounded percentage.

Examples covered by tests:

| Input with complete sample metadata and no LOW-context override | Before | After |
| --- | --- | --- |
| Replica wording alone | HIGH | MEDIUM |
| Simulated CV < 0.65 alone | HIGH | MEDIUM |
| New price deviation -60%, CV 0.70, no replica wording | HIGH through old shortcut | MEDIUM |
| New price deviation -60%, CV 0.64, no replica wording | HIGH | HIGH |
| Pre-owned price deviation -60% plus replica wording, CV 0.90 | HIGH | MEDIUM; price does not count as a New-stock signal |
| `AJOU-SYN-001`: wording, New price -84%, CV 0.42 | HIGH with approval recommendation | HIGH with verification recommendation |

These are illustrative business-rule changes, not measured improvements in detection accuracy.

## Evidence and approval semantics

Evidence kinds currently present are observed synthetic facts, rule-derived indicators, simulated CV, and optional AI-generated interpretation. **There are no independently verified items.** Review checkboxes acknowledge inspection; they cannot change provenance or verification status. The UI does not offer an “authenticate this fictional record” control.

The investigation draft is generated locally from selected evidence. Free editing of report claims was removed because unrestricted text could reintroduce an excluded claim. Reviewers write their decision rationale separately. The package preview does not require a recorded decision and never claims one exists.

The final human decision is meaningful even when it is Hold. HIGH RISK never automatically approves a complaint. No actual takedown approval can be made with these sample records. An external evidence intake and authentication process would be necessary before stronger action could be supported.

The server validates listing input and structured Gemini output. Client validation independently parses the analysis response. Model classification and action remain comparison-only. Draft, lock and evidence fields from the model are discarded; model interpretations cannot be selected as report evidence. The model is no longer asked to write a report. API keys remain server-side, and provider errors are sanitized.

## Design choices

The original visual identity remains: background `#F7F5F0`, white workspace, text `#161616`, borders `#DFDBD2`, action accent `#E84A27`, and risk red `#B91C1C`. Existing DM Sans, Plus Jakarta Sans and Korean font fallbacks remain.

The queue stays on the left. The main workspace proceeds through risk, visual comparison, evidence rows, draft and decision. The old source comparison table is collapsed, and provenance and uncertainty use native disclosure controls. No new modal was added. The existing package modal now displays the selected draft. Its focus returns to the opener on close, and Escape closes it.

## Verification evidence

See [the verification report](peer-feedback-verification.md) for exact checks, failures corrected and untested behavior. The repeatable check is:

```sh
node scripts/verify-peer-feedback.mjs
```

Screenshots show actual browser states:

- [Before, English](screenshots/before-en.png): original restored source and automatic definitive draft.
- [After, English](screenshots/after-en.png): wording selected, price excluded, documented Hold and expanded snapshot.
- [After, Korean](screenshots/after-ko.png): equivalent localized workflow.

## Proposed but not implemented

Real marketplace collection and submission, independent trademark authentication, external evidence upload, production CV measurement, validated real-world accuracy, durable multi-user audit storage and a real-world pilot are outside this implementation. No slide deck was requested; the two presentation files contain one bilingual speaking script and exact live demonstration cues. Post-change peer usability testing remains to be done.

## Changed files

| Area | Files |
| --- | --- |
| Domain and controls | `src/domain/evidenceReview.ts`, `src/domain/geminiBoundary.ts`, `src/domain/triageRules.ts`, `src/domain/types.ts`, `src/domain/syntheticCases.ts` |
| UI and localization | `src/App.tsx`, `src/components/EvidenceReviewPanel.tsx`, `src/components/TriageDetailWorkspace.tsx`, `src/components/ProductVisualComparison.tsx`, `src/components/ReportPackageModal.tsx`, `src/components/WorkflowContextView.tsx`, `src/i18n/translations.ts` |
| Server and tooling | `server.ts`, `package.json`, `package-lock.json`, `vite.config.ts`, `.gitignore` |
| Repeatable checks | `src/domain/triageRules.test.ts`, `src/domain/evidenceReview.test.ts`, `tests/api.test.ts`, `tests/browser/evidence.spec.ts`, `playwright.config.ts`, `scripts/verify-peer-feedback.mjs` |
| Presentation and evidence | This document, `docs/peer-feedback-verification.md`, `docs/peer-feedback-presentation-en.md`, `docs/peer-feedback-presentation-ko.md`, `docs/screenshots/before-en.png`, `docs/screenshots/after-en.png`, `docs/screenshots/after-ko.png` |
