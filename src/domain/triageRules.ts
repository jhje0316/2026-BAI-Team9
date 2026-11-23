import { createReportSnapshot } from './evidenceReview';
import type {
  GenuineSkuReference,
  Locale,
  RiskClassification,
  SuspectListingRecord,
  TriageEvaluation,
} from './types';

const SUSPICIOUS_PATTERNS = [
  'réplica 1:1',
  'replica 1:1',
  'replica',
  'réplica',
  'mirror quality',
  'aaa',
  'estilo ajou',
  'ajou-inspired',
  'inspired',
  'dupe',
  'factory surplus',
  '레플리카',
  '미러급',
];

const RESALE_PATTERNS = [
  'pre-owned',
  'secondhand',
  'second-hand',
  'used',
  'minor wear',
  'corner wear',
  'receipt',
  'vintage',
  '중고',
  '영수증',
];

export function calculatePriceDeviationPct(listedPrice: number, officialMsrp: number): number {
  if (officialMsrp <= 0) return 0;
  return Math.round(((listedPrice - officialMsrp) / officialMsrp) * 100);
}

export function detectSuspiciousKeywords(title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const matched = new Set<string>();
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (combined.includes(pattern)) {
      matched.add(pattern);
    }
  }
  return Array.from(matched);
}

export function detectResaleSignals(
  title: string,
  description: string,
  condition: SuspectListingRecord['condition']
): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  const signals = new Set<string>();
  if (condition === 'Pre-owned') {
    signals.add('Condition: Pre-owned');
  }
  for (const pattern of RESALE_PATTERNS) {
    if (combined.includes(pattern)) {
      signals.add(pattern);
    }
  }
  return Array.from(signals);
}

export function validateMandatoryAuditFields(
  listing: SuspectListingRecord,
  locale: Locale = 'ko'
): {
  valid: boolean;
  missingFields: string[];
  reasons: string[];
} {
  const isKo = locale === 'ko';
  const missingFields: string[] = [];
  const reasons: string[] = [];

  if (!listing.matchedSku || listing.matchedSku.trim().length === 0) {
    missingFields.push(isKo ? '매칭 SKU' : 'Matched SKU');
    reasons.push(
      isKo
        ? '위조 위험도 산정 전 공식 SKU 레퍼런스가 필수입니다.'
        : 'Official SKU reference is required before scoring.'
    );
  }

  if (!listing.sellerId || listing.sellerId.trim().length === 0 || listing.sellerStatus === 'Missing') {
    missingFields.push(isKo ? '판매자 ID' : 'Seller ID');
    reasons.push(
      isKo
        ? '판매자 식별자가 누락되어 공식 파트너 또는 개인 중고 리셀 여부를 검증할 수 없습니다.'
        : 'Seller identifier is missing; cannot verify distributor whitelist or reseller status.'
    );
  }

  if (!listing.captureTimestamp || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(listing.captureTimestamp) || !Number.isFinite(Date.parse(listing.captureTimestamp))) {
    missingFields.push(isKo ? '수집 타임스탬프(UTC)' : 'Capture Timestamp');
    reasons.push(
      isKo
        ? '플랫폼 권리 침해 증빙을 위한 유효한 UTC 수집 시각이 누락되었습니다.'
        : 'Valid UTC capture timestamp is required for platform IP evidence.'
    );
  }

  if (listing.trademarkStatus !== 'Active') {
    missingFields.push(
      isKo
        ? `상표권 상태 (${listing.targetCountryCode}: ${listing.trademarkStatus})`
        : `Trademark Status (${listing.targetCountryCode}: ${listing.trademarkStatus})`
    );
    reasons.push(
      isKo
        ? `${listing.targetCountryNameKo}(${listing.targetCountryCode}) 내 유효한 상표권 보호 범위가 아직 확정되지 않았습니다.`
        : `Active trademark protection in ${listing.targetCountryName} (${listing.targetCountryCode}) is not confirmed.`
    );
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
    reasons,
  };
}

// Illustrative baseline only. Both scoring and displayed rubric read these constants.
export const RISK_THRESHOLDS = {
  highSignalCount: 2, newPriceDeviationPct: -60, lowSimilarity: 0.65, resaleSimilarity: 0.8,
} as const;

export function getRiskRubric(locale: Locale): string {
  const t = RISK_THRESHOLDS;
  return locale === 'ko'
    ? `예시 기준: 필수 메타데이터 누락 시 HOLD. 다음으로 화이트리스트 판매자는 LOW. 그 외 리셀 단서 + 레플리카 문구 없음 + 시뮬레이션 유사도 >= ${t.resaleSimilarity.toFixed(2)}이면 LOW. 그 외 HIGH는 ${t.highSignalCount}개 이상 신호가 필요합니다: 레플리카 문구, New 상태에서 반올림 가격 편차 <= ${t.newPriceDeviationPct}%, 시뮬레이션 유사도 < ${t.lowSimilarity.toFixed(2)}. 나머지는 MEDIUM. 미등록 상태 자체는 고위험 신호가 아닙니다. 실제 정확도 검증 없음.`
    : `Illustrative baseline: missing mandatory metadata gives HOLD. Next, a whitelisted seller gives LOW. Otherwise resale cues + no replica wording + simulated similarity >= ${t.resaleSimilarity.toFixed(2)} gives LOW. Otherwise HIGH requires >= ${t.highSignalCount} signals: replica wording, New condition with rounded price deviation <= ${t.newPriceDeviationPct}%, simulated similarity < ${t.lowSimilarity.toFixed(2)}. All other cases give MEDIUM. Unlisted status alone is not a high-risk signal. No validated real-world accuracy.`;
}

export function evaluateDeterministicTriage(
  listing: SuspectListingRecord, skuRef: GenuineSkuReference, locale: Locale = 'ko',
): TriageEvaluation {
  const ko = locale === 'ko';
  const priceDeviationPct = calculatePriceDeviationPct(listing.listedPrice, listing.officialMsrp);
  const suspiciousKeywords = detectSuspiciousKeywords(listing.listingTitle, listing.listingDescription);
  const resaleSignals = detectResaleSignals(listing.listingTitle, listing.listingDescription, listing.condition);
  const isLegitimateResaleContext = listing.sellerStatus !== 'Whitelisted' && resaleSignals.length > 0 &&
    suspiciousKeywords.length === 0 && listing.visualSimilarityScore >= RISK_THRESHOLDS.resaleSimilarity;
  const mandatoryAudit = validateMandatoryAuditFields(listing, locale);
  const wordingSignal = suspiciousKeywords.length > 0;
  const priceSignal = listing.condition === 'New' && priceDeviationPct <= RISK_THRESHOLDS.newPriceDeviationPct;
  const visualSignal = listing.visualSimilarityScore < RISK_THRESHOLDS.lowSimilarity;
  const signalCount = [wordingSignal, priceSignal, visualSignal].filter(Boolean).length;
  const classification: RiskClassification = !mandatoryAudit.valid ? 'HOLD_MISSING_DATA'
    : listing.sellerStatus === 'Whitelisted' || isLegitimateResaleContext ? 'LOW_RISK'
    : signalCount >= RISK_THRESHOLDS.highSignalCount ? 'HIGH_RISK' : 'MEDIUM_RISK';
  const recommendedAction = classification === 'LOW_RISK' ? 'DISMISSED_LEGITIMATE' : 'HOLD_VERIFICATION';
  const rationaleBullets = [
    ko ? `예시 신호 ${signalCount}/3: 문구 ${wordingSignal ? '있음' : '없음'}, New 가격 편차 ${priceSignal ? '해당' : '미해당'} (${priceDeviationPct}%), 시뮬레이션 유사도 ${visualSignal ? '낮음' : '기준 이상'} (${listing.visualSimilarityScore.toFixed(2)}).`
      : `Illustrative signals ${signalCount}/3: wording ${wordingSignal ? 'flagged' : 'not flagged'}, New price threshold ${priceSignal ? 'met' : 'not met'} (${priceDeviationPct}%), simulated similarity ${visualSignal ? 'low' : 'above cutoff'} (${listing.visualSimilarityScore.toFixed(2)}).`,
    isLegitimateResaleContext
      ? ko ? '최초판매·중고 리셀 단서가 있습니다. 미등록 판매자라는 이유만으로 침해로 분류하지 않습니다.' : 'First-sale / resale cues are present. Unlisted status alone does not indicate infringement.'
      : ko ? `합성 판매자 상태 ${listing.sellerStatus}. 정품 리셀·병행수입 가능성은 별도 검토해야 합니다.` : `Synthetic seller status ${listing.sellerStatus}. Lawful resale and parallel imports require separate review.`,
    ko ? `필수 메타데이터 ${mandatoryAudit.valid ? '완비' : '누락'}. 합성 Active 권리 기록은 독립적으로 인증된 권리가 아닙니다.` : `Mandatory metadata ${mandatoryAudit.valid ? 'complete' : 'incomplete'}. A synthetic Active rights record is not independently authenticated.`,
  ];
  return {
    classification, recommendedAction, priceDeviationPct, suspiciousKeywords, resaleSignals, isLegitimateResaleContext,
    mandatoryAudit, isApprovalLocked: true,
    lockReason: !mandatoryAudit.valid
      ? ko ? `필수 메타데이터 보완 필요: ${mandatoryAudit.missingFields.join(', ')}. 독립 검증도 필요합니다.` : `Complete mandatory metadata: ${mandatoryAudit.missingFields.join(', ')}. Independent verification is also required.`
      : ko ? '독립적으로 검증된 증거가 없습니다. 합성 자료의 검토 완료는 실제 신고 승인을 해제하지 않습니다.' : 'No independently verified evidence. Reviewing synthetic data does not unlock takedown approval.',
    rationaleBullets, thresholdExplanation: getRiskRubric(locale),
    evidenceChecks: [
      { label: ko ? '시뮬레이션 시각 유사도' : 'Simulated visual similarity', status: visualSignal ? 'WARN' : 'PASS', detail: listing.visualSimilarityScore.toFixed(2), originTag: 'External', curationLimitation: ko ? '예시 SVG 그림과 수동 점수입니다. 실제 CV 측정·진위 확률이 아닙니다.' : 'Illustrative SVGs and assigned score. Not measured CV or an authenticity probability.' },
      { label: ko ? '리스팅 문구' : 'Listing wording', status: wordingSignal ? 'WARN' : 'PASS', detail: suspiciousKeywords.join(', '), originTag: 'External', curationLimitation: ko ? '합성 현지어 텍스트, 번역 검토 필요' : 'Synthetic local-language text; translation review required' },
      { label: ko ? '가격 편차' : 'Price deviation', status: priceSignal ? 'WARN' : 'PASS', detail: `${priceDeviationPct}%`, originTag: 'Internal', curationLimitation: ko ? '합성 MSRP이며 할인·중고 맥락 검토 필요' : 'Synthetic MSRP; review discounts and resale context' },
      { label: ko ? '판매자·권리 메타데이터' : 'Seller and rights metadata', status: mandatoryAudit.valid ? 'WARN' : 'FAIL', detail: listing.sellerStatus, originTag: 'Internal', curationLimitation: ko ? '가상 권리·판매자 기록, 독립 인증 없음' : 'Fictional rights and seller records; no independent authentication' },
    ],
    draftTakedownSummary: createReportSnapshot(listing.id, [], {}, locale).text,
    analysisSource: 'Deterministic Baseline',
    caveats: ko ? ['합성 데이터와 시뮬레이션 CV입니다. 실제 정확도는 검증되지 않았습니다.', '고위험 분류는 침해 결론이나 삭제 권고가 아닙니다.']
      : ['Synthetic data and simulated CV. Real-world accuracy is unvalidated.', 'High risk is not an infringement conclusion or a removal recommendation.'],
  };
}
