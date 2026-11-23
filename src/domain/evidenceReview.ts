import type {
  AuditLogEntry, DecisionDriver, EvidenceReview, GeminiAnalysis, GenuineSkuReference,
  HumanActionType, Locale, ReportSnapshot, ReviewEvidence, SuspectListingRecord, TriageEvaluation,
} from './types';

export function buildReviewEvidence(
  listing: SuspectListingRecord, sku: GenuineSkuReference, evaluation: TriageEvaluation,
  locale: Locale, ai: GeminiAnalysis | null = null,
): ReviewEvidence[] {
  const ko = locale === 'ko';
  const synthetic = ko ? '합성 데이터셋, 실제 수집·인증 없음' : 'Synthetic dataset; no real collection or authentication';
  const item = (entry: Omit<ReviewEvidence, 'simulated' | 'verification' | 'reportable'>): ReviewEvidence => ({
    ...entry, simulated: true, verification: 'synthetic_unverified', reportable: true,
  });
  const wording = `${listing.listingTitle}\n${listing.listingDescription}`;
  const price = `${listing.currency}${listing.listedPrice} / ${listing.currency}${listing.officialMsrp}; ${evaluation.priceDeviationPct}%`;
  const terms = evaluation.suspiciousKeywords.join(', ');
  const evidence: ReviewEvidence[] = [
    item({ id: 'wording', name: ko ? '리스팅 문구' : 'Listing wording', kind: 'synthetic_fact',
      source: `${synthetic} · ${listing.listingUrl}`, value: wording, available: true,
      uncertainty: ko ? '현지어 의미와 판매자 주장은 미검증입니다.' : 'Local-language meaning and seller claims are unverified.',
      facts: [ko ? `합성 리스팅 문구: "${wording}"` : `Synthetic listing wording: "${wording}"`],
      indicators: terms ? [ko ? `문구 규칙이 표시한 표현: ${terms}. 현지어 검토가 필요합니다.` : `Wording rule flagged: ${terms}. Local-language review is required.`] : [], }),
    item({ id: 'price', name: ko ? '가격 편차' : 'Price deviation', kind: 'rule_indicator',
      source: ko ? `합성 리스팅 가격 + 합성 MSRP · ${sku.sku} · 반올림 계산` : `Synthetic listing price + synthetic MSRP · ${sku.sku} · rounded calculation`,
      value: price, available: true, uncertainty: ko ? '할인이나 중고 상태가 가격을 설명할 수 있습니다.' : 'Discounts or used condition may explain price differences.', facts: [],
      indicators: [ko ? `합성 가격 비교: ${price}. 가격 차이만으로 진위를 판단할 수 없습니다.` : `Synthetic price comparison: ${price}. Price differences alone do not establish authenticity.`], }),
    item({ id: 'visual', name: ko ? '시뮬레이션 시각 유사도' : 'Simulated visual similarity', kind: 'simulated_cv',
      source: ko ? '수동 지정 CV 시뮬레이션 입력 + SVG 예시 그림' : 'Manually assigned CV simulation input + SVG illustrations',
      value: `${listing.visualSimilarityScore.toFixed(2)} · ${ko ? listing.visualObservationKo : listing.visualObservation}`,
      available: true, uncertainty: ko ? '실제 CV 측정값이나 위조 확률이 아닙니다. 촬영 각도·해상도도 영향을 줄 수 있습니다.' : 'Not a measured CV result or a counterfeit probability. Angle and resolution can affect comparison.', facts: [],
      indicators: [ko ? `시뮬레이션 시각 유사도 ${listing.visualSimilarityScore.toFixed(2)}. 값이 낮을수록 예시상 유사도가 낮으며, 진위 증거는 아닙니다.` : `Simulated visual similarity ${listing.visualSimilarityScore.toFixed(2)}. Lower values mean lower illustrative similarity, not evidence of authenticity.`], }),
    item({ id: 'seller', name: ko ? '판매자·리셀 맥락' : 'Seller and resale context', kind: 'synthetic_fact',
      source: ko ? '합성 판매자 목록 + 리스팅 상태' : 'Synthetic seller list + listing condition',
      value: `${listing.sellerId ?? (ko ? '누락' : 'Missing')} · ${listing.sellerStatus} · ${listing.condition}`,
      available: Boolean(listing.sellerId) && listing.sellerStatus !== 'Missing',
      uncertainty: ko ? '미등록 판매자도 정품을 적법하게 재판매할 수 있습니다. 병행수입 출처는 미검증입니다.' : 'An unlisted seller may lawfully resell genuine goods. Parallel-import provenance is unverified.',
      facts: [ko ? `합성 판매자 기록: ${listing.sellerId}, 상태 ${listing.sellerStatus}, 상품 상태 ${listing.condition}.` : `Synthetic seller record: ${listing.sellerId}, status ${listing.sellerStatus}, condition ${listing.condition}.`], indicators: [], }),
    item({ id: 'capture', name: ko ? '수집 메타데이터' : 'Capture metadata', kind: 'synthetic_fact',
      source: synthetic, value: listing.captureTimestamp ?? (ko ? '누락' : 'Missing'), available: Boolean(listing.captureTimestamp),
      uncertainty: ko ? '예시 시각이며 실제 플랫폼 채증 기록이 아닙니다.' : 'Illustrative timestamp, not a real platform evidence capture.',
      facts: [ko ? `합성 수집 시각: ${listing.captureTimestamp}.` : `Synthetic capture timestamp: ${listing.captureTimestamp}.`], indicators: [], }),
    item({ id: 'rights', name: ko ? 'SKU·권리 기록' : 'SKU and rights record', kind: 'synthetic_fact',
      source: ko ? '합성 SKU 카탈로그 + 가상 상표권 기록' : 'Synthetic SKU catalog + fictional trademark record',
      value: `${sku.sku} · ${sku.rightsRecordId} · ${listing.targetCountryCode} ${listing.trademarkStatus}`,
      available: listing.trademarkStatus === 'Active' && Boolean(listing.matchedSku),
      uncertainty: ko ? 'Active는 예시 필드값입니다. 실제 상표권 유효성·보호 범위의 독립 인증이 아닙니다.' : 'Active is a sample field value. Validity and scope have not been independently authenticated.',
      facts: [ko ? `가상 권리 기록: ${sku.rightsRecordId}, ${listing.targetCountryCode} ${listing.trademarkStatus}. 독립 인증 없음.` : `Fictional rights record: ${sku.rightsRecordId}, ${listing.targetCountryCode} ${listing.trademarkStatus}. No independent authentication.`], indicators: [], }),
  ];
  if (ai) evidence.push({ id: 'ai', name: ko ? 'Gemini 해석' : 'Gemini interpretation', kind: 'ai_interpretation',
    source: 'Gemini · gemini-4-hydrogen', value: ai.rationaleBullets.join('\n'), simulated: false,
    verification: 'untrusted_ai', available: true, reportable: false,
    uncertainty: ko ? '신뢰할 수 없는 실험적 AI 해석입니다. 보고서 근거로 포함할 수 없습니다.' : 'Untrusted experimental AI interpretation. Cannot be included as report evidence.', facts: [], indicators: [], });
  return evidence;
}

export function createReportSnapshot(caseId: string, items: ReviewEvidence[], review: EvidenceReview, locale: Locale): ReportSnapshot {
  const ko = locale === 'ko';
  const selected = items.filter(e => e.available && e.reportable && review[e.id]?.status === 'reviewed' && review[e.id]?.included);
  const facts = selected.flatMap(e => e.facts.map(f => `[${e.id}] ${f}`));
  const indicators = selected.flatMap(e => e.indicators.map(f => `[${e.id}] ${f}`));
  const none = ko ? '선택된 항목 없음.' : 'No selected items.';
  const text = [
    ko ? `검증 요청 초안 · ${caseId}` : `Verification request draft · ${caseId}`,
    ko ? '1. 관찰 사실, 합성 자료' : '1. Observed facts, synthetic data', ...facts.length ? facts : [none],
    ko ? '2. 의심 지표, 진위 결론 아님' : '2. Suspicious indicators, no authenticity conclusion', ...indicators.length ? indicators : [none],
    ko ? '3. 미검증 가정' : '3. Unverified assumptions',
    ko ? '선택된 자료는 합성 또는 시뮬레이션입니다. 진위, 권리 유효성, 리셀 적법성은 확인되지 않았습니다.' : 'Selected inputs are synthetic or simulated. Authenticity, enforceable rights and lawful resale status are not established.',
    ko ? '4. 요청하는 사람의 검증' : '4. Requested human verification',
    ...selected.map(e => `[${e.id}] ${e.uncertainty}`),
    ko ? '5. 제안하는 다음 단계' : '5. Proposed next steps',
    ko ? '독립 자료를 수집하고 권리·리셀 맥락을 검토하세요. 현재 초안은 조사용이며 삭제 요청이나 위법성 판단이 아닙니다.' : 'Collect independent evidence and review rights and resale context. This draft supports investigation and does not request removal or establish infringement.',
  ].join('\n\n');
  return { version: 'evidence-draft-v1', caseId, locale, text, selectedEvidenceIds: selected.map(e => e.id),
    evidenceStates: items.map(e => ({ id: e.id, review: review[e.id]?.status ?? 'unreviewed', included: selected.some(s => s.id === e.id), verification: e.verification, simulated: e.simulated, value: e.value, source: e.source })), };
}

export function getDecisionGates({ evaluation, items, review, confirmed, rationale, draft, caseId, locale }: {
  evaluation: TriageEvaluation; items: ReviewEvidence[]; review: EvidenceReview; confirmed: boolean;
  rationale: string; draft: string; caseId: string; locale: Locale;
}) {
  const snapshot = createReportSnapshot(caseId, items, review, locale);
  const allReviewed = items.every(e => review[e.id]?.status === 'reviewed');
  const validSelection = items.every(e => !review[e.id]?.included || (e.reportable && e.available && review[e.id]?.status === 'reviewed'));
  const canRecord = allReviewed && validSelection && confirmed && rationale.trim().length > 0 && snapshot.selectedEvidenceIds.length > 0 && draft === snapshot.text;
  // No independent evidence intake exists in this prototype. Reviewing a synthetic record cannot unlock a takedown.
  return { canRecord, canApproveTakedown: false, mandatoryComplete: evaluation.mandatoryAudit.valid, snapshot };
}

export function recordHumanDecision(input: Parameters<typeof getDecisionGates>[0] & {
  action: Exclude<HumanActionType, 'PENDING'>; driver: DecisionDriver; productName: string; timestamp: string;
}): AuditLogEntry | null {
  const gate = getDecisionGates(input);
  if (!gate.canRecord || (input.action === 'APPROVED_TAKEDOWN' && !gate.canApproveTakedown)) return null;
  return { id: `${input.caseId}-${input.timestamp}`, caseId: input.caseId, productName: input.productName,
    aiClassification: input.evaluation.classification, aiRecommendation: input.evaluation.recommendedAction,
    humanAction: input.action, decisionDriver: input.driver, overrodeAi: input.action !== input.evaluation.recommendedAction,
    note: input.rationale.trim(), timestamp: input.timestamp, selectedEvidenceIds: gate.snapshot.selectedEvidenceIds,
    evidenceStates: gate.snapshot.evidenceStates, draftSnapshot: gate.snapshot };
}
