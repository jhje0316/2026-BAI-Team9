import data from './preparedTriage.json';
import type { Locale, TriageEvaluation } from './types';

// Captured from the reviewed rubric for the bundled samples. The demo reads
// these snapshots without running a model or recomputing the classifications.
const evaluations = data as Record<string, Record<Locale, TriageEvaluation>>;

const summaries: Record<string, Record<Locale, string>> = {
  'AJOU-SYN-001': {
    ko: '‘réplica 1:1’ 문구, €45 대 기준가 €290, 시뮬레이션 유사도 0.42가 모두 추가 조사 신호입니다. 현지어 의미와 권리 기록을 확인하세요.',
    en: 'The “réplica 1:1” wording, €45 versus a €290 reference price, and simulated similarity of 0.42 all warrant investigation. Verify the local wording and rights record.',
  },
  'AJOU-SYN-002': {
    ko: '중고 상태와 영수증 언급이 정상 재판매를 뒷받침합니다. 판매자 목록 미등록 여부는 참고 정보입니다.',
    en: 'The used condition and receipt reference support a resale interpretation. Unlisted seller status is contextual information.',
  },
  'AJOU-SYN-003': {
    ko: '샘플 판매자 목록에 등록된 공식 파트너이며 기준 상품과 일치하는 정황이 있습니다.',
    en: 'The seller is an authorized partner in the sample registry, and the listing aligns with the reference product.',
  },
  'AJOU-SYN-004': {
    ko: '신품이 기준가보다 저렴하지만 레플리카 문구는 없습니다. 병행수입 가능성이 있어 유통 경로를 확인하세요.',
    en: 'The new item is priced below the reference, with no replica wording. Check the distribution channel for a possible parallel import.',
  },
  'AJOU-SYN-005': {
    ko: '판매자 ID와 채증 시각이 누락됐고 현지 상표권 상태도 미확인입니다. 세 항목을 확인할 때까지 보류하세요.',
    en: 'The seller ID and capture time are missing, and the local trademark status is unconfirmed. Hold the case pending all three checks.',
  },
};

export function preparedTriage(caseId: string, locale: Locale) {
  return { evaluation: evaluations[caseId][locale], summary: summaries[caseId][locale] };
}
