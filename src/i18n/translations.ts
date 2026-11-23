import type { DecisionDriver, HumanActionType, Locale, RiskClassification } from '../domain/types';

export const UI_COPY = {
  ko: {
    brandTitle: 'AJOU Brand Protection',
    navTriage: '트리아지 워크스페이스',
    navWorkflow: '파이프라인 · 한계 노트',
    navSampleData: '합성 데이터셋',
    ctaNewTest: '새 합성 테스트',
    heroKicker: 'AI 기반 패션 브랜드 가치 보호 · 위조품 대응 운영',
    heroTitle: '단일 리스팅 위조품 리스크 트리아지 & 증거 비교',
    heroMeta: '합성 데이터셋 · 시뮬레이션 CV/ERP · 인간 최종 승인',
    queueTitle: '합성 심사 큐',
    casesCountSuffix: '건',
    demoTagPrefix: '데모',
    queueFooter: '합성 샘플 데이터 전용 프로토타입입니다. 실시간 마켓플레이스 크롤링 및 자동 신고 전송은 의도적으로 제외되었습니다.',
    blindModeLabel: '원시 CV 점수 숨기기 (가설 테스트)',
    blindModeHint: '숫자 유사도 점수 대신 시각·텍스트 증거를 먼저 검토하도록 유도합니다.',
    runLiveGemini: '실시간 Gemini 실험 분석',
    runningLiveGemini: 'Gemini 분석 실행 중...',
    liveGeminiErrorPrefix: '실시간 Gemini API 오류:',
    sourceLabel: '분석 출처',
    sourceBaseline: '규칙 기반 기준선 (Baseline)',
    sourceLiveGemini: '실시간 Gemini (gemini-4-hydrogen)',
    capturedLabel: '수집 시각',
    missingUpper: '누락',
    thresholdRubric: '위험 등급 기준표',
    resaleBadgeTitle: '중고 리셀 단서 감지:',
    resaleBadgeBody: '합성 리셀 단서와 시뮬레이션 유사도가 부합합니다. 실제 정품 인증은 아니며 미등록 상태만으로 침해를 판단하지 않습니다.',
    lockBannerTitle: '신고 승인 잠금 · 필수 메타데이터 누락',
    fixSellerLabel: '판매자 ID',
    fixTimestampLabel: '수집 UTC 타임스탬프',
    fixTrademarkLabel: '상표권 상태',
    fixSubmitBtn: '합성 필드 보완',
    rationaleHeading: 'AI 증거 요약 (담당자 검토 필수)',
    sectionVisualHeading: '01. 시각 대조 (합성 리스팅 vs. 합성 SKU 기준)',
    collectedCaptureTitle: '합성 리스팅 예시 그림',
    genuineRefTitle: '합성 SKU 기준 예시 그림',
    scoreHiddenLabel: '점수 숨김 (증거 우선 검토)',
    scoreMatchSuffix: '시뮬레이션 유사도',
    sectionEvidenceHeading: '02. 데이터 큐레이션 기반 증거 대조표',
    colDimension: '검증 항목 / 출처',
    colExternal: '외부 수집 리스팅',
    colInternal: '내부 정품 기준',
    colCheck: '판정',
    searchQueryPrefix: '승인된 검색 쿼리:',
    officialMsrpSuffix: '공식 MSRP',
    authorizationPrefix: '권한 상태:',
    tmPrefix: '상표권:',
    sectionExperimentHeading: 'Part 5. AI 응답 비교 (규칙 기준선 vs. 실시간 Gemini 실험)',
    experimentCompareSubtitle: '동일 입력에 대한 일반 LLM의 응답 차이와 한계(오류·모호성·근거 부족)를 비교 기록합니다.',
    experimentColBaseline: '규칙 기반 기대 결과',
    experimentColGemini: '실시간 Gemini 실험 출력',
    experimentIssueLabel: '관찰된 AI 한계 유형',
    experimentNotePlaceholder: '예: 레플리카 문구는 맞췄으나 스페인어 맥락 일부를 과잉 추론함',
    experimentSaveBtn: '실험 관찰 기록',
    sectionDraftHeading: '04. 선택한 근거로 작성한 검증 요청 초안',
    previewPackageBtn: '선택 근거 패키지 미리보기',
    driverLabel: '핵심 판단 근거 (1가지 선택)',
    overrideNoteLabel: '담당자 판단 사유 (필수)',
    overrideNotePlaceholder: '예: 정품 영수증 확인으로 정상 리셀 기각 / 병행수입 출처 확인 필요',
    btnDismiss: '정품·정상 리셀로 기각',
    btnHold: '추가 검증 보류',
    btnApprove: '신고서 승인',
    transparencyPrefix: '투명성 고지:',
    auditHeading: '인간 의사결정 및 AI 재정의(Override) 감사 로그',
    auditRecordedSuffix: '건 기록됨',
    auditEmpty: '아직 이 세션에서 기록된 결정이 없습니다. 위 증거를 검토한 뒤 승인, 보류 또는 기각을 선택하세요.',
    auditColCase: '케이스 ID',
    auditColAi: 'AI 분류',
    auditColHuman: '담당자 결정',
    auditColDriver: '핵심 근거',
    auditColOverride: 'AI 재정의',
    auditColNote: '메모',
    auditColTime: '시각',
    overrideYes: '재정의함 (Override)',
    overrideNo: '일치',
    footerLeft: 'AJOU Brand Protection 프로토타입 · 합성 샘플 레코드 전용 (기밀/실제 고객 정보 미포함)',
    footerRight: '타 그룹 피드백 반영 · 독립 검증 전 실제 신고 승인 잠금',
    returnTriageBtn: '트리아지 워크스페이스로 돌아가기',
    pendingReview: '검토 대기',
    approvedStatus: '승인 완료',
    heldStatus: '보류 중',
    dismissedStatus: '기각(정상)',
  },
  en: {
    brandTitle: 'AJOU Brand Protection',
    navTriage: 'Triage Workspace',
    navWorkflow: 'Pipeline & Limits',
    navSampleData: 'Sample Dataset',
    ctaNewTest: 'New Synthetic Test',
    heroKicker: 'Protecting Fashion Brand Value with AI · Anti-Counterfeiting Operations',
    heroTitle: 'Single-Listing Counterfeit Risk Triage & Evidence Comparison',
    heroMeta: 'Synthetic Dataset · Simulated CV/ERP · Human-in-the-Loop Sign-off',
    queueTitle: 'Synthetic Triage Queue',
    casesCountSuffix: 'cases',
    demoTagPrefix: 'Demo',
    queueFooter: 'Synthetic sample data only. Live marketplace scraping and automated takedown submission are intentionally excluded.',
    blindModeLabel: 'Hide Raw CV Score (Bias Test)',
    blindModeHint: 'Encourages reviewing visual and text evidence before checking numeric similarity.',
    runLiveGemini: 'Run Live Gemini Experiment',
    runningLiveGemini: 'Running Gemini...',
    liveGeminiErrorPrefix: 'Live Gemini API Error:',
    sourceLabel: 'Source',
    sourceBaseline: 'Deterministic Baseline',
    sourceLiveGemini: 'Live Gemini (gemini-4-hydrogen)',
    capturedLabel: 'Captured',
    missingUpper: 'MISSING',
    thresholdRubric: 'Threshold Rubric',
    resaleBadgeTitle: 'Legitimate Resale / First-Sale Context Detected:',
    resaleBadgeBody: 'Synthetic resale cues align with simulated similarity. This is not authentication; unlisted status alone does not establish infringement.',
    lockBannerTitle: 'Report approval locked · Missing mandatory metadata',
    fixSellerLabel: 'Seller ID',
    fixTimestampLabel: 'Capture UTC Timestamp',
    fixTrademarkLabel: 'Trademark Scope',
    fixSubmitBtn: 'Update synthetic fields',
    rationaleHeading: 'AI Evidence Rationale (Human Validation Required)',
    sectionVisualHeading: '01. Visual comparison (synthetic listing vs. SKU reference)',
    collectedCaptureTitle: 'Synthetic listing illustration',
    genuineRefTitle: 'Synthetic SKU reference illustration',
    scoreHiddenLabel: 'Score Hidden (Evidence-First)',
    scoreMatchSuffix: 'simulated similarity',
    sectionEvidenceHeading: '02. Data-Curation Grounded Evidence Matrix',
    colDimension: 'Signal Dimension / Origin',
    colExternal: 'External Flagged Listing',
    colInternal: 'Internal Genuine Reference',
    colCheck: 'Audit',
    searchQueryPrefix: 'Approved query:',
    officialMsrpSuffix: 'Official MSRP',
    authorizationPrefix: 'Authorization:',
    tmPrefix: 'Trademark:',
    sectionExperimentHeading: 'Part 5. AI Response Comparison (Baseline Expected vs. Live Gemini)',
    experimentCompareSubtitle: 'Compare general LLM experimental output against baseline expectations and note discrepancies.',
    experimentColBaseline: 'Baseline Expected',
    experimentColGemini: 'Live Gemini Output',
    experimentIssueLabel: 'Observed AI Limitation',
    experimentNotePlaceholder: 'e.g., Flagged replica keywords accurately, but gave vague regional IP reasoning',
    experimentSaveBtn: 'Record Observation',
    sectionDraftHeading: '04. Verification draft from selected evidence',
    previewPackageBtn: 'Preview selected evidence package',
    driverLabel: 'Primary Decision Driver (Select 1)',
    overrideNoteLabel: 'Decision rationale (required)',
    overrideNotePlaceholder: 'e.g., Verified secondhand receipt or escalated for grey-market check',
    btnDismiss: 'Dismiss as Legitimate',
    btnHold: 'Hold for Verification',
    btnApprove: 'Approve Takedown Report',
    transparencyPrefix: 'Transparency notice:',
    auditHeading: 'Human Decision & AI Override Audit Log',
    auditRecordedSuffix: 'recorded',
    auditEmpty: 'No human decisions recorded yet in this session. Review the evidence above and choose Approve, Hold, or Dismiss.',
    auditColCase: 'Case ID',
    auditColAi: 'AI Verdict',
    auditColHuman: 'Human Action',
    auditColDriver: 'Key Driver',
    auditColOverride: 'Override',
    auditColNote: 'Note',
    auditColTime: 'Time',
    overrideYes: 'Overrode AI',
    overrideNo: 'Aligned',
    footerLeft: 'AJOU Brand Protection Prototype · Synthetic Sample Records Only (No Confidential Data)',
    footerRight: 'Peer feedback implemented · Takedown locked pending independent evidence',
    returnTriageBtn: 'Return to Triage Workspace',
    pendingReview: 'Pending review',
    approvedStatus: 'Approved',
    heldStatus: 'Held',
    dismissedStatus: 'Dismissed',
  },
} as const;

export function getClassificationLabel(
  classification: RiskClassification,
  locale: Locale
): string {
  if (locale === 'ko') {
    switch (classification) {
      case 'HIGH_RISK':
        return '고위험 (HIGH RISK) · 우선 조사 필요';
      case 'MEDIUM_RISK':
        return '중위험 (MEDIUM RISK) — 병행수입/출처 확인 필요';
      case 'LOW_RISK':
        return '저위험 (LOW RISK) · 리셀·파트너 단서';
      case 'HOLD_MISSING_DATA':
        return '보류 (HOLD) — 필수 감사 증거 누락';
    }
  }
  switch (classification) {
    case 'HIGH_RISK':
      return 'HIGH RISK · PRIORITIZE INVESTIGATION';
    case 'MEDIUM_RISK':
      return 'MEDIUM RISK — GREY MARKET / VERIFY SOURCE';
    case 'LOW_RISK':
      return 'LOW RISK · RESALE / PARTNER CUES';
    case 'HOLD_MISSING_DATA':
      return 'HOLD — MISSING MANDATORY EVIDENCE';
  }
}

export function getShortRiskLabel(
  classification: RiskClassification,
  locale: Locale
): string {
  if (locale === 'ko') {
    switch (classification) {
      case 'HIGH_RISK':
        return '고위험';
      case 'MEDIUM_RISK':
        return '중위험';
      case 'LOW_RISK':
        return '저위험';
      case 'HOLD_MISSING_DATA':
        return '보류(누락)';
    }
  }
  switch (classification) {
    case 'HIGH_RISK':
      return 'High Risk';
    case 'MEDIUM_RISK':
      return 'Medium Risk';
    case 'LOW_RISK':
      return 'Low Risk';
    case 'HOLD_MISSING_DATA':
      return 'Hold — Missing';
  }
}

export function getHumanActionLabel(
  action: HumanActionType,
  locale: Locale
): string {
  const t = UI_COPY[locale];
  switch (action) {
    case 'APPROVED_TAKEDOWN':
      return t.approvedStatus;
    case 'HOLD_VERIFICATION':
      return t.heldStatus;
    case 'DISMISSED_LEGITIMATE':
      return t.dismissedStatus;
    case 'PENDING':
      return t.pendingReview;
  }
}

export function getDecisionDriverOptions(locale: Locale): { value: DecisionDriver; label: string }[] {
  if (locale === 'ko') {
    return [
      { value: 'REPLICA_KEYWORDS', label: '레플리카·위조 문구 탐지' },
      { value: 'PRICE_ANOMALY', label: 'MSRP 대비 비정상 저가' },
      { value: 'VISUAL_MISMATCH', label: '로고·실루엣 시각 불일치' },
      { value: 'RESALE_CONTEXT', label: '정상 중고·영수증 맥락' },
      { value: 'AUTHORIZED_WHITELIST', label: '공식 화이트리스트 파트너' },
      { value: 'MISSING_AUDIT_DATA', label: '필수 감사 정보 누락' },
      { value: 'OTHER', label: '기타 담당자 판단' },
    ];
  }
  return [
    { value: 'REPLICA_KEYWORDS', label: 'Replica / counterfeit wording' },
    { value: 'PRICE_ANOMALY', label: 'Abnormal price vs. MSRP' },
    { value: 'VISUAL_MISMATCH', label: 'Logo / silhouette mismatch' },
    { value: 'RESALE_CONTEXT', label: 'Lawful secondhand context' },
    { value: 'AUTHORIZED_WHITELIST', label: 'Authorized partner whitelist' },
    { value: 'MISSING_AUDIT_DATA', label: 'Missing mandatory audit fields' },
    { value: 'OTHER', label: 'Other specialist judgment' },
  ];
}

export const EVIDENCE_COPY = {
  ko: {
    heading: '03. 증거 검토 및 보고서 선택',
    intro: '각 항목을 검토한 뒤 초안에 포함할 근거를 직접 선택하세요. 검토 완료는 실제 사실 인증이 아닙니다.',
    reviewed: '검토 완료', include: '초안에 포함', source: '출처', value: '관찰값', uncertainty: '한계와 불확실성',
    simulated: '합성·시뮬레이션', untrusted: '미검증 AI 해석', unverified: '독립 검증 없음', unavailable: '자료 누락 또는 보고서 근거로 사용 불가',
    synthetic_fact: '관찰된 합성 사실', rule_indicator: '규칙으로 계산한 지표', simulated_cv: '시뮬레이션 CV', ai_interpretation: 'AI 생성 해석',
    confirmation: '모든 항목을 검토했고, 선택한 근거와 남은 불확실성을 확인했습니다.',
    unresolved: '미해결: 실제 진위·권리 범위·적법한 리셀 여부의 독립 검증 없음. 검토 완료로 해소되지 않습니다.',
    gates: '모든 항목 검토 → 근거 선택 → 선택 확인 → 판단 사유 입력 후 보류·기각을 기록할 수 있습니다.',
    snapshot: '선택 근거와 초안 스냅샷', noSelection: '선택된 근거 없음', aiRecommendation: 'AI 권고',
    previewTitle: '선택 근거 검토 패키지', previewNotice: '미리보기는 승인이 아닙니다. 합성 자료이며 실제 제출 기능은 없습니다.',
    copy: '초안 복사', copied: '복사 완료', close: '닫기', saved: '결정과 초안 스냅샷을 기록했습니다.',
    flow: '위험 검토 → 증거 검토·선택 → 초안 확인 → 사람의 결정',
    scoreExplanation: '수동 지정한 0~1 시뮬레이션 입력입니다. 낮을수록 예시상 시각 유사도가 낮습니다. 실제 CV 측정값이나 위조품일 확률이 아닙니다.',
    illustrationNotice: '양쪽 이미지는 합성 SVG 예시입니다. 실제 리스팅 사진이나 인증된 정품 사진이 아닙니다.',
  },
  en: {
    heading: '03. Review and select evidence',
    intro: 'Review each item, then choose what enters the draft. Reviewed does not mean independently authenticated.',
    reviewed: 'Reviewed', include: 'Include in draft', source: 'Source', value: 'Observed value', uncertainty: 'Limitations and uncertainty',
    simulated: 'Synthetic / simulated', untrusted: 'Untrusted AI interpretation', unverified: 'Not independently verified', unavailable: 'Missing or not eligible as report evidence',
    synthetic_fact: 'Observed synthetic fact', rule_indicator: 'Rule-derived indicator', simulated_cv: 'Simulated CV', ai_interpretation: 'AI-generated interpretation',
    confirmation: 'I reviewed every item and confirmed my selections and unresolved uncertainties.',
    unresolved: 'Unresolved: no independent verification of authenticity, rights scope or lawful resale. Marking reviewed does not resolve these.',
    gates: 'Review every item, select evidence, confirm selections and enter a rationale to record Hold or Dismiss.',
    snapshot: 'Selected evidence and draft snapshot', noSelection: 'No selected evidence', aiRecommendation: 'AI recommendation',
    previewTitle: 'Selected evidence review package', previewNotice: 'Preview is not approval. Synthetic data only; no platform submission is available.',
    copy: 'Copy draft', copied: 'Copied', close: 'Close', saved: 'Decision and draft snapshot recorded.',
    flow: 'Review risk → Review and select evidence → Inspect draft → Human decision',
    scoreExplanation: 'Manually assigned simulation input on a 0–1 scale. Lower values mean lower illustrative visual similarity. It is not a measured CV result or a probability of counterfeiting.',
    illustrationNotice: 'Both images are synthetic SVG illustrations, not marketplace photographs or authenticated product images.',
  },
} as const;

export function getRecommendationLabel(action: Exclude<HumanActionType, 'PENDING'>, locale: Locale): string {
  const t = UI_COPY[locale];
  switch (action) {
    case 'HOLD_VERIFICATION': return t.btnHold;
    case 'DISMISSED_LEGITIMATE': return t.btnDismiss;
    case 'APPROVED_TAKEDOWN': return t.btnApprove;
  }
}
