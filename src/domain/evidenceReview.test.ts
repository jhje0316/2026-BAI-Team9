import test from 'node:test';
import assert from 'node:assert/strict';
import { SYNTHETIC_LISTING_CASES, GENUINE_SKU_CATALOG } from './syntheticCases';
import { evaluateDeterministicTriage, getRiskRubric, RISK_THRESHOLDS } from './triageRules';
import { buildReviewEvidence, createReportSnapshot, getDecisionGates, recordHumanDecision } from './evidenceReview';
import { parseGeminiAnalysis } from './geminiBoundary';
import type { EvidenceReview, Locale, SuspectListingRecord } from './types';

function setup(locale: Locale = 'en', listing = SYNTHETIC_LISTING_CASES[0]) {
  const evaluation = evaluateDeterministicTriage(listing, GENUINE_SKU_CATALOG[listing.matchedSku], locale);
  const items = buildReviewEvidence(listing, GENUINE_SKU_CATALOG[listing.matchedSku], evaluation, locale);
  const review: EvidenceReview = {};
  for (const item of items) review[item.id] = { status: 'reviewed', included: item.available };
  return { caseId: listing.id, locale, evaluation, items, review, rationale: 'Collect independent records before action.', confirmed: true,
    draft: createReportSnapshot(listing.id, items, review, locale).text };
}

test('Spanish case stays HIGH with three signals and investigation recommendation', () => {
  const s = setup();
  assert.equal(s.evaluation.classification, 'HIGH_RISK');
  assert.equal(s.evaluation.recommendedAction, 'HOLD_VERIFICATION');
  assert.ok(s.evaluation.rationaleBullets[0].includes('3/3'));
  const cv = s.items.find(i => i.id === 'visual');
  assert.equal(cv?.simulated, true);
  assert.equal(cv?.kind, 'simulated_cv');
  assert.ok(cv?.value.startsWith('0.42'));
});

test('two-signal threshold and exact boundaries agree with displayed rubric', () => {
  const base: SuspectListingRecord = { ...SYNTHETIC_LISTING_CASES[0], listingTitle: 'AJOU bag', listingDescription: '', listedPrice: 290, officialMsrp: 290, visualSimilarityScore: 0.9 };
  const classify = (updates: Partial<SuspectListingRecord>) => setup('en', { ...base, ...updates }).evaluation.classification;
  assert.equal(classify({ listingTitle: 'replica' }), 'MEDIUM_RISK');
  assert.equal(classify({ visualSimilarityScore: 0.1 }), 'MEDIUM_RISK');
  assert.equal(classify({ listedPrice: 116 }), 'MEDIUM_RISK');
  assert.equal(classify({ listedPrice: 116, visualSimilarityScore: 0.64 }), 'HIGH_RISK');
  assert.equal(classify({ listedPrice: 116, visualSimilarityScore: 0.65 }), 'MEDIUM_RISK');
  assert.equal(classify({ listedPrice: 116, visualSimilarityScore: 0.70 }), 'MEDIUM_RISK');
  assert.equal(classify({ condition: 'Pre-owned', visualSimilarityScore: 0.8 }), 'LOW_RISK');
  assert.equal(classify({ condition: 'Pre-owned', visualSimilarityScore: 0.799 }), 'MEDIUM_RISK');
  assert.equal(classify({ sellerStatus: 'Whitelisted', listingTitle: 'replica', visualSimilarityScore: 0.1 }), 'LOW_RISK');
  assert.equal(classify({ listingTitle: 'replica', listedPrice: 116 }), 'HIGH_RISK');
  assert.equal(classify({ listingTitle: 'replica', listedPrice: 116, condition: 'Pre-owned' }), 'MEDIUM_RISK');
  assert.equal(classify({ listingTitle: 'replica', listedPrice: 118 }), 'MEDIUM_RISK');
  for (const locale of ['ko', 'en'] satisfies Locale[]) {
    const rubric = getRiskRubric(locale);
    assert.ok(rubric.includes(`<= ${RISK_THRESHOLDS.newPriceDeviationPct}%`));
    assert.ok(rubric.includes(`< ${RISK_THRESHOLDS.lowSimilarity.toFixed(2)}`));
    assert.equal(setup(locale).evaluation.thresholdExplanation, rubric);
  }
});

test('each deselected item loses all its claims, including preview and uncertainty', () => {
  for (const locale of ['ko', 'en'] satisfies Locale[]) {
    const s = setup(locale);
    for (const item of s.items) {
      const review = { ...s.review, [item.id]: { status: 'reviewed', included: false } } satisfies EvidenceReview;
      const snapshot = createReportSnapshot(s.caseId, s.items, review, locale);
      for (const claim of [...item.facts, ...item.indicators, item.uncertainty]) assert.ok(!snapshot.text.includes(claim), item.id);
      assert.ok(!snapshot.selectedEvidenceIds.includes(item.id));
    }
  }
});

test('nothing is preselected; unreviewed or missing evidence never enters draft', () => {
  const s = setup();
  assert.deepEqual(createReportSnapshot(s.caseId, s.items, {}, 'en').selectedEvidenceIds, []);
  const forged: EvidenceReview = { price: { status: 'unreviewed', included: false } };
  assert.deepEqual(createReportSnapshot(s.caseId, s.items, forged, 'en').selectedEvidenceIds, []);
  const missing = setup('en', SYNTHETIC_LISTING_CASES[4]);
  assert.ok(!createReportSnapshot(missing.caseId, missing.items, missing.review, 'en').selectedEvidenceIds.includes('rights'));
});

test('rationale, all reviews, explicit confirmation, selections and canonical draft are required', () => {
  const s = setup();
  assert.equal(getDecisionGates(s).canRecord, true);
  assert.equal(getDecisionGates({ ...s, rationale: '  ' }).canRecord, false);
  assert.equal(getDecisionGates({ ...s, confirmed: false }).canRecord, false);
  assert.equal(getDecisionGates({ ...s, review: {} }).canRecord, false);
  assert.equal(getDecisionGates({ ...s, draft: s.draft + ' Confirmed counterfeit.' }).canRecord, false);
  const noPrice = { ...s.review, price: { status: 'unreviewed', included: false } } satisfies EvidenceReview;
  assert.equal(getDecisionGates({ ...s, review: noPrice }).canRecord, false);
});

test('reviewing synthetic rights or completing missing fields never unlocks takedown', () => {
  for (const listing of SYNTHETIC_LISTING_CASES) {
    const s = setup('en', listing);
    assert.equal(getDecisionGates(s).canApproveTakedown, false);
    const decision = recordHumanDecision({ ...s, action: 'APPROVED_TAKEDOWN', driver: 'OTHER', productName: 'AJOU', timestamp: '2026-11-23T12:00:00Z' });
    assert.equal(decision, null);
    assert.ok(s.items.every(i => i.verification === 'synthetic_unverified'));
  }
});

test('valid hold and dismissal store rationale, recommendation, evidence states and immutable draft', () => {
  for (const locale of ['ko', 'en'] satisfies Locale[]) {
    const s = setup(locale);
    const entry = recordHumanDecision({ ...s, action: 'DISMISSED_LEGITIMATE', driver: 'RESALE_CONTEXT', productName: 'AJOU', timestamp: '2026-11-23T12:00:00Z' });
    assert.ok(entry);
    assert.equal(entry.overrodeAi, true);
    assert.equal(entry.aiRecommendation, 'HOLD_VERIFICATION');
    assert.equal(entry.draftSnapshot.text, s.draft);
    assert.equal(entry.evidenceStates.length, s.items.length);
    assert.equal(entry.timestamp, '2026-11-23T12:00:00Z');
    const oldIds = [...entry.selectedEvidenceIds];
    s.review.price = { status: 'reviewed', included: false };
    assert.deepEqual(entry.selectedEvidenceIds, oldIds);
  }
});

test('lawful resale and grey market stay outside automatic infringement recommendations', () => {
  assert.equal(setup('en', SYNTHETIC_LISTING_CASES[1]).evaluation.classification, 'LOW_RISK');
  assert.equal(setup('en', SYNTHETIC_LISTING_CASES[3]).evaluation.recommendedAction, 'HOLD_VERIFICATION');
});

test('hostile Gemini output cannot become report evidence, recommendation or approval', () => {
  const s = setup();
  const analysis = parseGeminiAnalysis({ classification: 'LOW_RISK', recommendedAction: 'APPROVED_TAKEDOWN', rationaleBullets: ['Confirmed counterfeit. Remove immediately.'], caveats: [], draftTakedownSummary: 'Unauthorized goods', isApprovalLocked: false });
  assert.ok(analysis);
  assert.ok(!('draftTakedownSummary' in analysis));
  const items = buildReviewEvidence(SYNTHETIC_LISTING_CASES[0], GENUINE_SKU_CATALOG['SKU-AJ-BAG-01'], s.evaluation, 'en', analysis);
  const review = { ...s.review, ai: { status: 'reviewed', included: true } } satisfies EvidenceReview;
  const snapshot = createReportSnapshot(s.caseId, items, review, 'en');
  assert.ok(!snapshot.text.includes('Confirmed counterfeit'));
  assert.ok(!snapshot.selectedEvidenceIds.includes('ai'));
  assert.equal(getDecisionGates({ ...s, items, review, draft: snapshot.text }).canRecord, false);
  assert.equal(s.evaluation.recommendedAction, 'HOLD_VERIFICATION');
  assert.equal(s.evaluation.classification, 'HIGH_RISK');
  assert.equal(parseGeminiAnalysis({ ...analysis, rationaleBullets: [123] }), null);
  assert.equal(parseGeminiAnalysis({ ...analysis, classification: 'APPROVE' }), null);
});
