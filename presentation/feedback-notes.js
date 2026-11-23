export const feedbackNotes = {
  visual: {
    number: 2,
    ko: ['시각 유사도', '0.42가 어떤 척도의 값인지, 수치가 무엇을 의미하는지 설명해 달라는 의견이 있었습니다.', '점수 옆에 0~1 범위의 시뮬레이션 입력이라고 설명합니다. 낮을수록 예시에서 시각적 유사도가 낮습니다.'],
    en: ['Visual similarity', 'Peers asked what 0.42 meant and how to interpret the scale.', 'The comparison now explains the 0–1 simulation input beside the score. Lower values indicate lower illustrative similarity.'],
  },
  risk: {
    number: 1,
    ko: ['위험 등급 기준', '어떤 신호가 최종 HIGH RISK 판정에 영향을 주는지 설명해 달라는 의견이 있었습니다.', '레플리카 문구, 신품 가격 편차 −60% 이하, 시각 유사도 0.65 미만 중 2개 이상이면 고위험입니다. AJOU-SYN-001은 세 조건을 충족하며 추가 검증을 권고합니다.'],
    en: ['Risk criteria', 'Peers asked how the signals contributed to the final HIGH RISK rating.', 'HIGH requires two signals among replica wording, a new-item price deviation of −60% or lower, and simulated similarity below 0.65. AJOU-SYN-001 meets all three and recommends verification.'],
  },
  resale: {
    number: 3,
    ko: ['정품 재판매 맥락', '미등록 판매자도 정품을 적법하게 재판매할 수 있다는 의견이 있었습니다.', '최신 판정 기준은 위험 신호를 집계하기 전에 판매자와 재판매 맥락을 확인합니다. AJOU-SYN-002에서 저위험 판정의 맥락을 볼 수 있습니다.'],
    en: ['Lawful resale context', 'Peers pointed out that an unlisted seller can lawfully resell genuine goods.', 'The revised rubric checks seller and resale context before counting risk signals. AJOU-SYN-002 illustrates the reasoning for a low-risk rating.'],
  },
  evidence: {
    number: 4,
    ko: ['초안에 넣을 근거 선택', '담당자가 초안에 들어가는 근거를 항목별로 직접 통제하고 싶다는 요청이 있었습니다.', '최신 버전에서는 각 근거를 검토한 뒤 포함 여부를 고릅니다. 예를 들어 가격 근거를 빼면 초안과 패키지 미리보기에서 금액이 사라집니다.'],
    en: ['Evidence selection', 'Peers wanted reviewers to control which individual evidence items entered the draft.', 'Reviewers now inspect and select evidence item by item. Removing the price evidence removes the prices from both the draft and the package preview.'],
  },
  draft: {
    number: 5,
    ko: ['신고 초안의 표현', '미검증 근거를 바탕으로 위반을 단정하고 즉시 삭제를 요청하는 표현이 강하다는 의견이 있었습니다.', '최신 버전의 조사 초안은 관찰 사실, 의심 신호, 아직 검증하지 않은 가정과 후속 확인을 구분합니다.'],
    en: ['Report wording', 'Peers found the draft too definitive when it claimed infringement and asked for immediate removal.', 'The revised investigation draft distinguishes observations, suspicion indicators, unverified assumptions and follow-up checks.'],
  },
};
