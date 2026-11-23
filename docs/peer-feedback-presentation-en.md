# Team 9: peer feedback presentation

Speak only the paragraphs between the script markers. Bracketed cues are actions, not spoken words. Target duration is five minutes, including short pauses for the demo. The Korean translation and speaker notes are in `peer-feedback-presentation-ko.md`.

<!-- script:start -->
## 0:00–0:40 | Project introduction

[Show the improved workspace in English.]

Hello, we are Team 9. Our project is Protecting Fashion Brand Value with AI. Fashion brands face suspicious listings across countries, languages, and sellers. Reviewing them requires comparing products, checking records, and deciding whether further investigation is justified.

Our prototype helps a brand protection specialist organize that review. It compares a listing with internal product references and shows risk indicators. The organizational question is how AI can support a responsible decision when the available evidence is incomplete. Today, we will compare our original prototype with the changes we made after another group reviewed it.

## 0:40–1:30 | Before peer feedback

[Show before-en.png. Point to AJOU-SYN-001, the comparison, score, and original draft.]

Our main example is the Spanish case, AJOU-SYN-001. In the original version, it received a HIGH RISK result. The listing contained replica wording, and its price was forty-five euros against a reference price of two hundred ninety euros.

The screen also showed a visual similarity score of zero point four two beside a product comparison. These were synthetic illustrations and a simulated score, not an actual counterfeit detection result.

A draft report appeared automatically. It used expressions such as “unauthorized goods” and requested immediate removal. A reviewer could edit the draft, approve it, hold the case, or dismiss it. Missing mandatory metadata already blocked approval.

## 1:30–2:15 | What the other group found

[Keep the original screenshot visible.]

The other group found the comparison useful and the human review workflow understandable. But they could not easily explain what zero point four two meant, or how it contributed to HIGH RISK.

They also felt the report sounded too certain. An unlisted seller might be legally reselling a genuine product. Their most important request was direct control over the evidence included in the draft.

For an organization, these issues matter because a confident draft can encourage staff to accept an AI suggestion without enough checking. An unsupported complaint can harm a legitimate seller and weaken trust in the brand’s review process.

## 2:15–3:45 | After implementing feedback

[Return to the improved app. Open Threshold Rubric and point to the score explanation.]

The improved screen explains that lower simulated scores mean lower illustrative similarity. The score is not a probability of counterfeiting. We also corrected a mismatch between the old explanation and its code. HIGH RISK now requires at least two defined signals, after the metadata and seller context checks. This case has all three signals, so it remains high risk. The recommendation is further verification.

[Review all six evidence rows. Include Listing wording and Price deviation.]

Reviewers now inspect each item’s observed value, source, uncertainty, and verification status. Nothing is included automatically. Marking an item reviewed does not authenticate it. Fictional trademark records and simulated scores stay unverified.

[Uncheck Include in draft for Price deviation. Open the package preview, then close it.]

Here is a concrete change. When I exclude the price evidence, its price claim disappears from both the draft and the package. The report separates observed synthetic facts, suspicious indicators, assumptions, verification requests, and next steps.

[Confirm selections, choose Replica / counterfeit wording, enter the rationale, and click Hold for Verification. Open the audit snapshot.]

A decision requires reviewing every item, confirming selections, and writing a reason. The log records that decision and the exact draft. Takedown approval stays locked because this prototype has no independently verified evidence. Experimental Gemini output cannot change these controls.

## 3:45–4:30 | Business value and limitations

[Point to the audit record and unresolved uncertainties.]

These changes support more consistent reviews and make the reviewer’s reasoning visible. They can help reduce unsupported complaints by connecting each draft claim to an explicit evidence selection. We have not measured a business improvement or tested the revised interface with the other group again.

Automated checks covered the rules, evidence controls, API responses, and browser workflow in Korean and English. However, all case records remain synthetic, CV values are simulated, and real-world accuracy is unvalidated. There is no automatic platform submission. Audit records last only for the current session. Live Gemini service access was not tested because no API key was configured.

## 4:30–5:00 | Final recommendation

[Leave the documented Hold decision visible.]

Our prototype demonstrates how peer feedback can turn an automatic draft into a more accountable human review process. Before a real pilot, management should require authentic source records, independently checked rights, a validated visual model, and secure audit storage.

For our AI-Driven Organization project, we recommend using AI to prioritize investigation while people control evidence and decisions. Approve a limited pilot only after those foundations are verified.
<!-- script:end -->

## Exact live demo clicks

Start `npm run dev` and open `http://localhost:3000`. Use Chrome. Refresh before rehearsal to clear the session log. Keep `docs/screenshots/before-en.png` open in an image viewer for the original workflow. The improved app does not have a before-mode switch.

| Time | Click or show | Expected result |
| --- | --- | --- |
| Before speaking | Click **English**, then queue case **AJOU-SYN-001**. | HIGH RISK with an investigation label. |
| 0:40 | Switch to `before-en.png`. Point to comparison, `0.42 CV Match`, original draft and approval buttons. | Actual original screen from revision `c080767e95a0699c4afdb030938977cd6fc020ba`. Do not click old approval during the talk. |
| 2:15 | Return to the app. Click **Threshold Rubric**. Scroll to the comparison explanation. | Two-signal rule and simulation explanation. |
| 2:40 | Scroll to **03. Review and select evidence**. Click **Reviewed** on all six rows. Open **Source · Limitations and uncertainty** on the rights row briefly. | Each remains **Not independently verified**. No Include checkbox is checked automatically. |
| 2:55 | Check **Include in draft** for **Listing wording** and **Price deviation**. | Draft contains `[wording]` and `[price]`, including `€45 / €290; -84%`. |
| 3:05 | Uncheck **Include in draft** for **Price deviation**. | `[price]` and its amounts disappear. |
| 3:12 | Click **Preview selected evidence package**. Show the package. Click **Close**. | Only the selected wording claim and general verification guidance appear. Preview is not approval. |
| 3:22 | Check **I reviewed every item...**. Select **Replica / counterfeit wording** in **Primary Decision Driver**. Enter `Verify local wording and independent rights before any complaint.` in **Decision rationale**. | **Hold for Verification** and **Dismiss as Legitimate** become available. **Approve Takedown Report** stays disabled. |
| 3:35 | Click **Hold for Verification**. Scroll to the log. Open **Selected evidence and draft snapshot**. | The rationale, selection, unverified states, timestamp and `evidence-draft-v1` snapshot are recorded. |
| 3:45 onward | Keep the audit log visible. | Explain business value, limits and recommendation. |

Do not run Live Gemini during the five-minute demo. No key is configured in the verified environment. If time is short, use the actual `after-en.png` screenshot for the evidence and audit portions. Do not describe it as a new user test.

## Rehearsal notes

Pause while removing price evidence so the audience can see the change. Preselecting all evidence would defeat the point of the demo. Review all items, then include only the two named items and remove price. The final decision is Hold, because actual takedown approval cannot be supported by this synthetic dataset.

The script covers six timed sections in one presentation. It is a speaking script with screenshots and live demo cues, not a slide deck. No slide deck was requested. The before/after evidence and test limitations are documented in `peer-feedback-before-after.md` and `peer-feedback-verification.md`.
