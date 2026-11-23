import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePriceDeviationPct,
  detectResaleSignals,
  detectSuspiciousKeywords,
  evaluateDeterministicTriage,
  validateMandatoryAuditFields,
} from './triageRules';
import { GENUINE_SKU_CATALOG, SYNTHETIC_LISTING_CASES } from './syntheticCases';

test('calculates price deviation percentage accurately', () => {
  assert.equal(calculatePriceDeviationPct(45, 290), -84);
  assert.equal(calculatePriceDeviationPct(160, 320), -50);
  assert.equal(calculatePriceDeviationPct(34000, 34800), -2);
});

test('detects Spanish, English, and Korean replica keywords', () => {
  const hits = detectSuspiciousKeywords(
    'Bolso media luna estilo AJOU - réplica 1:1',
    'Calidad espejo AAA 미러급'
  );
  assert.ok(hits.includes('réplica 1:1'));
  assert.ok(hits.includes('estilo ajou'));
  assert.ok(hits.includes('aaa'));
  assert.ok(hits.includes('미러급'));
});

test('separates legitimate secondhand resale from counterfeit infringement in both ko and en', () => {
  const resaleCase = SYNTHETIC_LISTING_CASES.find((c) => c.id === 'AJOU-SYN-002')!;
  const skuRef = GENUINE_SKU_CATALOG[resaleCase.matchedSku];
  const signals = detectResaleSignals(
    resaleCase.listingTitle,
    resaleCase.listingDescription,
    resaleCase.condition
  );
  assert.ok(signals.length >= 2);

  const koResult = evaluateDeterministicTriage(resaleCase, skuRef, 'ko');
  assert.equal(koResult.classification, 'LOW_RISK');
  assert.equal(koResult.isLegitimateResaleContext, true);
  assert.equal(koResult.recommendedAction, 'DISMISSED_LEGITIMATE');
  assert.equal(koResult.isApprovalLocked, false);
  assert.ok(koResult.rationaleBullets[0].includes('중고 리셀'));

  const enResult = evaluateDeterministicTriage(resaleCase, skuRef, 'en');
  assert.equal(enResult.classification, 'LOW_RISK');
  assert.ok(enResult.rationaleBullets[0].includes('First-sale / resale'));
});

test('classifies clear Spanish AJOU ARC replica as HIGH_RISK and generates Korean/English draft', () => {
  const highRiskCase = SYNTHETIC_LISTING_CASES.find((c) => c.id === 'AJOU-SYN-001')!;
  const skuRef = GENUINE_SKU_CATALOG[highRiskCase.matchedSku];

  const koResult = evaluateDeterministicTriage(highRiskCase, skuRef, 'ko');
  assert.equal(koResult.classification, 'HIGH_RISK');
  assert.equal(koResult.recommendedAction, 'APPROVED_TAKEDOWN');
  assert.equal(koResult.isApprovalLocked, false);
  assert.ok(koResult.draftTakedownSummary.includes('AJOU ARC 숄더백'));
  assert.equal(koResult.evidenceChecks.length, 4);
  assert.ok(koResult.evidenceChecks[0].curationLimitation.length > 0);
});

test('classifies grey market edge listing as MEDIUM_RISK', () => {
  const greyCase = SYNTHETIC_LISTING_CASES.find((c) => c.id === 'AJOU-SYN-004')!;
  const skuRef = GENUINE_SKU_CATALOG[greyCase.matchedSku];
  const result = evaluateDeterministicTriage(greyCase, skuRef, 'ko');
  assert.equal(result.classification, 'MEDIUM_RISK');
  assert.equal(result.recommendedAction, 'HOLD_VERIFICATION');
});

test('always enforces hard approval lock when mandatory audit fields are missing', () => {
  const incompleteCase = SYNTHETIC_LISTING_CASES.find((c) => c.id === 'AJOU-SYN-005')!;
  const skuRef = GENUINE_SKU_CATALOG[incompleteCase.matchedSku];

  const audit = validateMandatoryAuditFields(incompleteCase, 'ko');
  assert.equal(audit.valid, false);
  assert.ok(audit.missingFields.includes('판매자 ID'));
  assert.ok(audit.missingFields.includes('수집 타임스탬프(UTC)'));

  const evalResult = evaluateDeterministicTriage(incompleteCase, skuRef, 'ko');
  assert.equal(evalResult.classification, 'HOLD_MISSING_DATA');
  assert.equal(evalResult.isApprovalLocked, true);
});

test('completing missing audit fields unlocks gate and re-evaluates risk', () => {
  const incompleteCase = SYNTHETIC_LISTING_CASES.find((c) => c.id === 'AJOU-SYN-005')!;
  const skuRef = GENUINE_SKU_CATALOG[incompleteCase.matchedSku];
  const completed = {
    ...incompleteCase,
    sellerId: 'LojaSul_BR',
    sellerStatus: 'Unlisted' as const,
    trademarkStatus: 'Active' as const,
    captureTimestamp: '2026-11-19T12:00:00Z',
  };

  const result = evaluateDeterministicTriage(completed, skuRef, 'ko');
  assert.equal(result.mandatoryAudit.valid, true);
  assert.equal(result.isApprovalLocked, false);
  assert.equal(result.classification, 'HIGH_RISK');
});
