import type {
  EvidenceCheckItem,
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

  if (!listing.captureTimestamp || listing.captureTimestamp.trim().length === 0) {
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

export function evaluateDeterministicTriage(
  listing: SuspectListingRecord,
  skuRef: GenuineSkuReference,
  locale: Locale = 'ko'
): TriageEvaluation {
  const isKo = locale === 'ko';
  const priceDeviationPct = calculatePriceDeviationPct(listing.listedPrice, listing.officialMsrp);
  const suspiciousKeywords = detectSuspiciousKeywords(listing.listingTitle, listing.listingDescription);
  const resaleSignals = detectResaleSignals(listing.listingTitle, listing.listingDescription, listing.condition);
  const isLegitimateResaleContext =
    listing.sellerStatus !== 'Whitelisted' &&
    resaleSignals.length > 0 &&
    suspiciousKeywords.length === 0 &&
    listing.visualSimilarityScore >= 0.8;

  const mandatoryAudit = validateMandatoryAuditFields(listing, locale);
  const visualObs = isKo ? listing.visualObservationKo : listing.visualObservation;
  const productName = isKo ? skuRef.productNameKo : skuRef.productName;
  const countryName = isKo ? listing.targetCountryNameKo : listing.targetCountryName;

  let classification: RiskClassification;
  let recommendedAction: TriageEvaluation['recommendedAction'];
  const rationaleBullets: string[] = [];
  let thresholdExplanation = '';

  if (!mandatoryAudit.valid) {
    classification = 'HOLD_MISSING_DATA';
    recommendedAction = 'HOLD_VERIFICATION';
    rationaleBullets.push(
      isKo
        ? `필수 감사 게이트 미통과: ${mandatoryAudit.missingFields.join(', ')}.`
        : `Mandatory evidence gate failed: ${mandatoryAudit.missingFields.join(', ')}.`,
      isKo
        ? `가격은 공식 MSRP 대비 ${priceDeviationPct}%(${listing.currency}${listing.officialMsrp}) 수준이나, 불완전한 메타데이터로 침해 단정을 보류합니다.`
        : `Price shows ${priceDeviationPct}% vs. MSRP (${listing.currency}${listing.officialMsrp}), but incomplete metadata blocks infringement conclusion.`,
      isKo
        ? `시각 유사도(${listing.visualSimilarityScore.toFixed(2)})만으로는 누락된 수집 시각이나 ${listing.targetCountryCode} 상표권 확인을 대체할 수 없습니다.`
        : `Visual match (${listing.visualSimilarityScore.toFixed(2)}) cannot override missing audit timestamp or unverified ${listing.targetCountryCode} trademark scope.`
    );
    thresholdExplanation = isKo
      ? 'HOLD_MISSING_DATA는 데이터 큐레이션 규칙에 따라 SKU, 판매자 ID, 수집 타임스탬프, 국가별 유효 상표권 중 하나라도 누락·미확인일 때 자동 발동하여 위법한 신고 제출을 원천 차단합니다.'
      : 'HOLD_MISSING_DATA triggers whenever SKU, Seller ID, Capture Timestamp, or Active Regional Trademark Scope is missing—preventing unlawful takedown filings.';
  } else if (listing.sellerStatus === 'Whitelisted') {
    classification = 'LOW_RISK';
    recommendedAction = 'DISMISSED_LEGITIMATE';
    rationaleBullets.push(
      isKo
        ? `판매자 "${listing.sellerId}"가 ${listing.targetCountryCode} 공식 유통 파트너 화이트리스트와 일치합니다.`
        : `Seller "${listing.sellerId}" matches active ${listing.targetCountryCode} authorized distributor whitelist.`,
      isKo
        ? `판매가 편차(${priceDeviationPct}% vs. MSRP)가 정상 공식 리테일 허용 범위 내에 있습니다.`
        : `Listed price (${priceDeviationPct}% vs. MSRP) falls within normal authorized retail variance.`,
      isKo
        ? `시각 레퍼런스 일치도는 ${listing.visualSimilarityScore.toFixed(2)}입니다 (${visualObs}).`
        : `Visual reference match is ${listing.visualSimilarityScore.toFixed(2)} (${visualObs}).`
    );
    thresholdExplanation = isKo
      ? 'LOW RISK는 공식 화이트리스트 파트너이거나, 레플리카 문구 없이 높은 시각 일치도(>=0.80)와 정당한 중고 리셀 맥락이 확인될 때 적용됩니다.'
      : 'LOW RISK applies when seller is whitelisted or legitimate secondhand context aligns with high visual authenticity (>= 0.80) and zero replica claims.';
  } else if (isLegitimateResaleContext) {
    classification = 'LOW_RISK';
    recommendedAction = 'DISMISSED_LEGITIMATE';
    rationaleBullets.push(
      isKo
        ? `최초판매·중고 리셀 맥락(${resaleSignals.join(', ')})이 감지되어 MSRP 대비 ${priceDeviationPct}% 할인 가격이 설명됩니다.`
        : `First-sale / resale context detected (${resaleSignals.join(', ')}), explaining ${priceDeviationPct}% below MSRP.`,
      isKo
        ? `높은 시각 일치도(${listing.visualSimilarityScore.toFixed(2)}) 확인: ${visualObs}.`
        : `High visual authenticity (${listing.visualSimilarityScore.toFixed(2)}): ${visualObs}.`,
      isKo
        ? '레플리카 표현이 없는 정품 중고 개인 판매는 화이트리스트 미등록 판매자더라도 상표권 침해로 간주하지 않습니다.'
        : 'Unlisted individual seller does not indicate infringement when authentic secondhand goods are sold without replica claims.'
    );
    thresholdExplanation = isKo
      ? 'LOW RISK(정상 리셀)는 미등록 판매자라도 중고 상태·영수증 등 최초판매 단서와 높은 시각 정품 일치도(>=0.80)가 함께 나타날 때 위조품과 구분합니다.'
      : 'LOW RISK (Resale) separates lawful secondhand listings (high visual match >= 0.80 + resale context) from unauthorized new counterfeit stock.';
  } else if (
    suspiciousKeywords.length > 0 ||
    (priceDeviationPct <= -60 && listing.visualSimilarityScore < 0.75) ||
    listing.visualSimilarityScore < 0.65
  ) {
    classification = 'HIGH_RISK';
    recommendedAction = 'APPROVED_TAKEDOWN';
    if (suspiciousKeywords.length > 0) {
      rationaleBullets.push(
        isKo
          ? `NLP가 명시적 위조·레플리카 문구를 탐지했습니다: ${suspiciousKeywords.map((k) => `"${k}"`).join(', ')}.`
          : `NLP detected explicit counterfeit/replica phrasing: ${suspiciousKeywords.map((k) => `"${k}"`).join(', ')}.`
      );
    }
    rationaleBullets.push(
      isKo
        ? `"New" 상품 조건에서 ${listing.targetCountryCode} 공식 MSRP 대비 ${priceDeviationPct}%의 심각한 가격 이상치(${listing.currency}${listing.listedPrice} vs. ${listing.currency}${listing.officialMsrp})가 확인됩니다.`
        : `Severe price anomaly of ${priceDeviationPct}% below official ${listing.targetCountryCode} MSRP (${listing.currency}${listing.listedPrice} vs. ${listing.currency}${listing.officialMsrp}) for "New" condition.`,
      isKo
        ? `시뮬레이션 CV 유사도가 낮습니다(${listing.visualSimilarityScore.toFixed(2)}): ${visualObs}.`
        : `Simulated CV similarity is low (${listing.visualSimilarityScore.toFixed(2)}): ${visualObs}.`,
      isKo
        ? `판매자 "${listing.sellerId}"는 ${listing.targetCountryCode} 공식 유통사가 아니며, 활성 상표권(${skuRef.rightsRecordId})이 확인되었습니다.`
        : `Seller "${listing.sellerId}" is unlisted in ${listing.targetCountryCode} distributor records; active trademark ${skuRef.rightsRecordId} confirmed.`
    );
    thresholdExplanation = isKo
      ? 'HIGH RISK는 명시적 레플리카 키워드, 새상품 기준 MSRP 대비 60% 초과 저가 판매, 또는 CV 유사도 0.65 미만 중 2개 이상의 위조 신호가 수렴할 때 부여됩니다.'
      : 'HIGH RISK requires >= 2 converging signals: explicit replica wording, >60% below MSRP on new stock, or CV similarity < 0.65 against genuine references.';
  } else {
    classification = 'MEDIUM_RISK';
    recommendedAction = 'HOLD_VERIFICATION';
    rationaleBullets.push(
      isKo
        ? `미등록 판매자 "${listing.sellerId}"의 "New / Sealed" 상품에서 MSRP 대비 ${priceDeviationPct}% 수준의 중간 가격 편차가 관찰됩니다.`
        : `Moderate price gap (${priceDeviationPct}% vs. MSRP) for "New / Sealed" inventory from unlisted seller "${listing.sellerId}".`,
      isKo
        ? `패키징과 실루엣은 정품 레퍼런스와 유사(${listing.visualSimilarityScore.toFixed(2)})하나, ${visualObs}.`
        : `Packaging and silhouette closely match genuine reference (${listing.visualSimilarityScore.toFixed(2)}), but ${visualObs.toLowerCase()}.`,
      isKo
        ? '명시적 레플리카 문구는 없으므로 위조 제조가 아닌 무단 병행수입(Grey Market) 유통 여부를 추가 검증해야 합니다.'
        : 'No explicit replica wording detected; could indicate unauthorized grey-market diversion rather than counterfeit manufacturing.'
    );
    thresholdExplanation = isKo
      ? 'MEDIUM RISK는 레플리카 문구 없이 외관이 정품과 유사(-20%~-55% MSRP 편차)한 미등록 판매자 사례에 적용되며, 정식 신고 전 병행수입 출처 확인을 권고합니다.'
      : 'MEDIUM RISK applies to edge cases (e.g., authentic-looking new items from unlisted sellers at -20% to -55% MSRP without replica terms) requiring grey-market verification before IP filing.';
  }

  const isApprovalLocked = !mandatoryAudit.valid;
  const lockReason = isApprovalLocked
    ? isKo
      ? `신고 승인 잠금: ${mandatoryAudit.missingFields.join(', ')} 항목을 검증·보완해야 신고서 승인이 가능합니다.`
      : `Report approval locked: complete ${mandatoryAudit.missingFields.join(', ')} to unlock takedown submission.`
    : null;

  const evidenceChecks: EvidenceCheckItem[] = [
    {
      label: isKo ? '이미지 및 실루엣 대조' : 'Visual & Silhouette Match',
      status:
        listing.visualSimilarityScore >= 0.85
          ? 'PASS'
          : listing.visualSimilarityScore >= 0.65
            ? 'WARN'
            : 'FAIL',
      detail: `${listing.visualSimilarityScore.toFixed(2)} · ${visualObs}`,
      originTag: 'External',
      curationLimitation: isKo
        ? '데이터 큐레이션 한계: 스튜디오 정품 사진 대비 실물 리스팅의 저해상도·크롭·비정형 각도는 CV 유사도를 낮출 수 있음.'
        : 'Data limitation: Low-res, cropped, or user-taken angles reduce visual match reliability vs. studio catalog photos.',
    },
    {
      label: isKo ? '리스팅 텍스트 및 표현' : 'Listing Language & Claims',
      status: suspiciousKeywords.length > 0 ? 'FAIL' : 'PASS',
      detail:
        suspiciousKeywords.length > 0
          ? isKo
            ? `의심 표현 탐지: ${suspiciousKeywords.join(', ')}`
            : `Flagged terms: ${suspiciousKeywords.join(', ')}`
          : isLegitimateResaleContext
            ? isKo
              ? `중고 리셀 단서: ${resaleSignals.join(', ')}`
              : `Secondhand cues: ${resaleSignals.join(', ')}`
            : isKo
              ? '위조·레플리카 표현 미탐지'
              : 'No counterfeit phrasing detected',
      originTag: 'External',
      curationLimitation: isKo
        ? '데이터 큐레이션 한계: 현지어 번역이나 은어·슬랭 문구 해석 시 오탐(False Positive) 가능.'
        : 'Data limitation: Translated or slang terms may cause false positives; external listing text may be noisy.',
    },
    {
      label: isKo ? '공식 MSRP 대비 가격 편차' : 'Price vs. Official MSRP',
      status:
        priceDeviationPct <= -60 && !isLegitimateResaleContext
          ? 'FAIL'
          : priceDeviationPct <= -20
            ? 'WARN'
            : 'PASS',
      detail: `${listing.currency}${listing.listedPrice.toLocaleString()} vs. ${listing.currency}${listing.officialMsrp.toLocaleString()} (${priceDeviationPct}%)`,
      originTag: 'Internal',
      curationLimitation: isKo
        ? '데이터 큐레이션 한계: 환율 변동, 정상 시즌 할인, 중고 시세가 위조품의 저가 할인 패턴과 유사할 수 있음.'
        : 'Data limitation: Currency shifts, seasonal discounts, or secondhand pricing can mimic counterfeit discounting.',
    },
    {
      label: isKo ? '판매자 권한 및 국가별 상표권' : 'Seller & Regional IP Scope',
      status: !mandatoryAudit.valid
        ? 'FAIL'
        : listing.sellerStatus === 'Whitelisted' || isLegitimateResaleContext
          ? 'PASS'
          : 'WARN',
      detail: !mandatoryAudit.valid
        ? isKo
          ? `누락/대기: ${mandatoryAudit.missingFields.join(', ')}`
          : `Missing/Pending: ${mandatoryAudit.missingFields.join(', ')}`
        : `${listing.sellerStatus} (${listing.sellerId}) · ${listing.targetCountryCode} TM ${listing.trademarkStatus}`,
      originTag: !mandatoryAudit.valid ? 'Newly Collected' : 'Internal',
      curationLimitation: isKo
        ? '데이터 큐레이션 한계: 화이트리스트 미등록만으로 침해가 입증되지 않으며, 타임스탬프·상표권 누락 시 위법 신고 위험.'
        : 'Data limitation: Whitelist updates lag behind new partnerships; missing timestamp or IP scope blocks lawful takedowns.',
    },
  ];

  const draftTakedownSummary = !mandatoryAudit.valid
    ? isKo
      ? `[승인 차단 — 필수 증거 누락] ${mandatoryAudit.missingFields.join(', ')} 항목 검증 완료 전까지 플랫폼 신고서 초안을 생성할 수 없습니다.`
      : `[BLOCKED — INCOMPLETE EVIDENCE] Cannot generate platform takedown report until ${mandatoryAudit.missingFields.join(', ')} ${mandatoryAudit.missingFields.length === 1 ? 'is' : 'are'} verified.`
    : classification === 'HIGH_RISK'
      ? isKo
        ? `상표권 및 디자인권 침해 신고 초안 (${skuRef.rightsRecordId}): ${listing.marketplace}에 게시된 리스팅 ${listing.id}("${listing.listingTitle}")은 공식 판매자(${countryName})가 아닌 "${listing.sellerId}"가 AJOU(${productName}, ${skuRef.sku})를 무단 인용해 MSRP 대비 ${priceDeviationPct}% 저가(${listing.currency}${listing.listedPrice} vs. ${listing.currency}${listing.officialMsrp})로 판매 중입니다. ${listing.captureTimestamp} 채증 기준 시각 점검 결과 ${visualObs}이(가) 확인되어 즉시 삭제를 요청합니다.`
        : `Notice of Trademark & Design Infringement (${skuRef.rightsRecordId}): Listing ${listing.id} on ${listing.marketplace} ("${listing.listingTitle}") unlawfully references AJOU (${skuRef.productName}, ${skuRef.sku}) while offering unauthorized goods at ${priceDeviationPct}% below official MSRP (${listing.currency}${listing.listedPrice} vs. ${listing.currency}${listing.officialMsrp}). Captured ${listing.captureTimestamp}, seller "${listing.sellerId}" is not an authorized ${countryName} distributor, and visual inspection confirms ${visualObs.toLowerCase()}. Request immediate listing removal.`
      : classification === 'MEDIUM_RISK'
        ? isKo
          ? `사전 확인 보류 요청 (${skuRef.rightsRecordId}): ${listing.marketplace} 내 미등록 판매자 "${listing.sellerId}"의 리스팅 ${listing.id}("${listing.listingTitle}")는 정품과 유사한 패키징(${listing.visualSimilarityScore.toFixed(2)})을 보이나 MSRP 대비 ${priceDeviationPct}% 가격에 판매 중입니다. 공식 IP 신고 전 지역 유통망을 통해 병행수입 여부를 확인해야 합니다.`
          : `Preliminary Verification Hold (${skuRef.rightsRecordId}): Listing ${listing.id} ("${listing.listingTitle}") offered by unlisted seller "${listing.sellerId}" on ${listing.marketplace} shows genuine-looking packaging (${listing.visualSimilarityScore.toFixed(2)} match) at ${priceDeviationPct}% below MSRP. Escalate to regional distributor check for grey-market diversion before submitting formal IP takedown.`
        : isKo
          ? `침해 신고 미권고: 판매자 "${listing.sellerId}"의 리스팅 ${listing.id}("${listing.listingTitle}")는 ${listing.sellerStatus === 'Whitelisted' ? '공식 유통 파트너 기록' : '정품 중고 최초판매 리셀 맥락'} 및 높은 시각 일치도(${listing.visualSimilarityScore.toFixed(2)})와 부합합니다.`
          : `No Infringement Filing Recommended: Listing ${listing.id} ("${listing.listingTitle}") by "${listing.sellerId}" aligns with ${listing.sellerStatus === 'Whitelisted' ? 'authorized distributor records' : 'lawful secondhand first-sale resale context'} and authentic visual indicators (${listing.visualSimilarityScore.toFixed(2)} match).`;

  return {
    classification,
    priceDeviationPct,
    suspiciousKeywords,
    resaleSignals,
    isLegitimateResaleContext,
    mandatoryAudit,
    isApprovalLocked,
    lockReason,
    rationaleBullets,
    thresholdExplanation,
    evidenceChecks,
    draftTakedownSummary,
    recommendedAction,
    analysisSource: 'Deterministic Baseline',
    caveats: isKo
      ? [
          'CV 시각 유사도 수치와 ERP/화이트리스트 레코드는 합성 시뮬레이션 입력입니다.',
          '담당자는 최종 승인 전 국가별 상표권 유효성과 정품 중고 리셀 여부를 직접 확인해야 합니다.',
        ]
      : [
          'CV similarity score and ERP/whitelist records are simulated synthetic inputs.',
          'Specialist must verify regional trademark scope and lawful resale status before action.',
        ],
  };
}
