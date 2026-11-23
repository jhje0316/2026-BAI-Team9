import type { DecisionDriver, HumanActionType, Locale, RiskClassification } from '../domain/types';

export const UI_COPY = {
  ko: {
    brandTitle: 'AI Anti-Counterfeit Solution',
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
    resaleBadgeTitle: '정상 중고 리셀 / 최초판매 컨텍스트 감지:',
    resaleBadgeBody: '중고 상태 단서와 높은 시각 정품 일치도가 함께 확인되어, 미등록 개인 판매자라는 이유만으로 위조품으로 분류하지 않습니다.',
    lockBannerTitle: '신고 승인 잠금 — 필수 감사 증거 누락',
    fixSellerLabel: '판매자 ID',
    fixTimestampLabel: '수집 UTC 타임스탬프',
    fixTrademarkLabel: '상표권 상태',
    fixSubmitBtn: '필드 검증 및 잠금 해제',
    rationaleHeading: 'AI 증거 요약 (담당자 검토 필수)',
    sectionVisualHeading: '01. 시각 및 실루엣 대조 (외부 수집 vs. 내부 스튜디오 레퍼런스)',
    collectedCaptureTitle: '수집된 리스팅 이미지',
    genuineRefTitle: '공식 SKU 스튜디오 레퍼런스',
    scoreHiddenLabel: '점수 숨김 (증거 우선 검토)',
    scoreMatchSuffix: 'CV 일치도',
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
    sectionDraftHeading: '03. 신고서 요약 초안 (담당자 수정 가능)',
    previewPackageBtn: '3종 신고 패키지 미리보기',
    driverLabel: '핵심 판단 근거 (1가지 선택)',
    overrideNoteLabel: '담당자 검토 / AI 판단 수정 사유 (선택)',
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
    footerLeft: '위조상품 검토 프로토타입 · 합성 샘플 레코드 전용 (기밀/실제 고객 정보 미포함)',
    footerRight: '타 그룹 피어 테스트 진행 전 단계 · 모든 신고 최종 승인은 인간 담당자가 수행합니다.',
    returnTriageBtn: '트리아지 워크스페이스로 돌아가기',
    pendingReview: '검토 대기',
    approvedStatus: '승인 완료',
    heldStatus: '보류 중',
    dismissedStatus: '기각(정상)',
  },
  en: {
    brandTitle: 'AI Anti-Counterfeit Solution',
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
    resaleBadgeBody: 'Unlisted individual seller does not indicate counterfeiting when secondhand cues align with authentic visual indicators.',
    lockBannerTitle: 'Report Approval Locked — Mandatory Audit Evidence Missing',
    fixSellerLabel: 'Seller ID',
    fixTimestampLabel: 'Capture UTC Timestamp',
    fixTrademarkLabel: 'Trademark Scope',
    fixSubmitBtn: 'Verify & Unlock Fields',
    rationaleHeading: 'AI Evidence Rationale (Human Validation Required)',
    sectionVisualHeading: '01. Visual & Silhouette Comparison (External Capture vs. Internal Studio Ref)',
    collectedCaptureTitle: 'Collected Listing Capture',
    genuineRefTitle: 'Genuine SKU Studio Reference',
    scoreHiddenLabel: 'Score Hidden (Evidence-First)',
    scoreMatchSuffix: 'CV Match',
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
    sectionDraftHeading: '03. Pre-Filled Takedown Summary (Editable by Specialist)',
    previewPackageBtn: 'Preview 3-Document Package',
    driverLabel: 'Primary Decision Driver (Select 1)',
    overrideNoteLabel: 'Specialist Review / Override Note (Optional)',
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
    footerLeft: 'AI Anti-Counterfeit Prototype · Synthetic Sample Records Only (No Confidential Data)',
    footerRight: 'Pre-peer-testing build · Specialists retain final takedown authorization.',
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
        return '고위험 (HIGH RISK) — 위조품 가능성 높음';
      case 'MEDIUM_RISK':
        return '중위험 (MEDIUM RISK) — 병행수입/출처 확인 필요';
      case 'LOW_RISK':
        return '저위험 (LOW RISK) — 정품/정상 리셀 가능성 높음';
      case 'HOLD_MISSING_DATA':
        return '보류 (HOLD) — 필수 감사 증거 누락';
    }
  }
  switch (classification) {
    case 'HIGH_RISK':
      return 'HIGH RISK — LIKELY COUNTERFEIT';
    case 'MEDIUM_RISK':
      return 'MEDIUM RISK — GREY MARKET / VERIFY SOURCE';
    case 'LOW_RISK':
      return 'LOW RISK — LEGITIMATE / AUTHORIZED';
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
