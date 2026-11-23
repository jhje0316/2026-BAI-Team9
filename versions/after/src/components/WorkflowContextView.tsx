import type { AuditLogEntry, Locale } from '../domain/types';
import { UI_COPY } from '../i18n/translations';

export function WorkflowContextView({
  locale,
  auditLogs,
  onBackToTriage,
}: {
  locale: Locale;
  auditLogs: AuditLogEntry[];
  onBackToTriage: () => void;
}) {
  const isKo = locale === 'ko';
  const t = UI_COPY[locale];

  const approvedCount = auditLogs.filter((l) => l.humanAction === 'APPROVED_TAKEDOWN').length;
  const overrideCount = auditLogs.filter((l) => l.overrodeAi).length;

  const steps = isKo
    ? [
        {
          num: '01',
          owner: '생성형 AI + 담당자 승인',
          title: '현지 검색어 생성 (프로토타입 범위 외)',
          detail:
            '국가별 브랜드 변형어, 오탈자, 현지 판매자 은어("AJOU-inspired crescent bag", "bolso media luna estilo AJOU")를 제안하고 직원이 승인합니다.',
          scopeNote: '본 프로토타입에서는 사전 정의된 검색 쿼리 맥락만 참조',
        },
        {
          num: '02',
          owner: '검색 자동화',
          title: '일괄 검색 및 증빙 수집 (프로토타입 범위 외)',
          detail:
            '허용된 마켓플레이스에서 승인된 키워드로 리스팅 URL, 판매자 ID, 화면 캡처 및 UTC 수집 타임스탬프를 저장합니다.',
          scopeNote: '실시간 웹 크롤링·스크래핑은 의도적으로 제외',
        },
        {
          num: '03',
          owner: 'CV + NLP + 브랜드 보호 전문가',
          title: '의심 리스팅 트리아지 & 증거 대조 (현재 프로토타입 핵심)',
          detail:
            '수집된 이미지·문구·가격·판매자 권한·국가별 상표권을 정품 SKU 기준과 대조해 위험 등급과 설명을 생성하고, 담당자가 승인/보류/기각을 결정합니다.',
          scopeNote: '과제 Part 3 핵심 검증 기능',
          active: true,
        },
        {
          num: '04',
          owner: '생성형 AI + 법무 검토',
          title: '선택 근거 초안 및 사람의 판단',
          detail:
            '검토자가 선택한 합성 근거로 조사용 초안을 작성합니다. 모든 항목 검토, 선택 확인, 판단 사유를 거쳐 보류·기각을 기록합니다. 독립 검증 전 실제 신고 승인은 잠겨 있습니다.',
          scopeNote: '선택 근거 초안·미리보기 지원, 실제 신고 승인·자동 제출 제외',
        },
      ]
    : [
        {
          num: '01',
          owner: 'Generative AI + Staff',
          title: 'Generate Local Search Terms (Out of Scope)',
          detail:
            'Proposes market-specific brand variants and seller phrasing ("AJOU-inspired crescent bag", "bolso media luna estilo AJOU") for staff approval.',
          scopeNote: 'Pre-seeded query context shown for traceability only',
        },
        {
          num: '02',
          owner: 'Search Automation',
          title: 'Batch Search & Collect (Out of Scope)',
          detail:
            'Retrieves listing URLs, seller IDs, screenshots, and UTC capture timestamps across permitted marketplaces.',
          scopeNote: 'Live marketplace crawling intentionally excluded',
        },
        {
          num: '03',
          owner: 'Computer Vision + NLP + Specialist',
          title: 'Assess Suspect Listings (Active Prototype Scope)',
          detail:
            'Compares listing imagery, copy, price, seller authorization, and regional trademark scope against genuine AJOU references for human triage.',
          scopeNote: 'Core testable feature (Assignment Part 3)',
          active: true,
        },
        {
          num: '04',
          owner: 'Generative AI + Legal',
          title: 'Prepare selected evidence review draft',
          detail:
            'Builds an investigation draft from reviewer-selected synthetic evidence. Hold or dismiss requires review, confirmation and rationale. Takedown stays locked without independent evidence.',
          scopeNote: 'Selected evidence preview supported; actual takedown approval and submission unavailable',
        },
      ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border border-[#DFDBD2] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#DFDBD2]">
          <div>
            <p className="text-xs font-medium text-[#E84A27]">
              {isKo
                ? '중간 발표(Slide 10, 14, 17) 및 과제 Part 7 기준 정렬'
                : 'Mid-term Strategy (Slides 10, 14, 17) & Part 7 Transparency'}
            </p>
            <h2 className="text-xl font-bold text-[#161616] mt-1">
              {isKo
                ? 'AJOU 위조품 대응 파이프라인 내 프로토타입 위치 및 한계'
                : 'Prototype Scope, Proposed KPIs & Honest Limitations'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToTriage}
            className="px-4 py-2 text-xs font-medium bg-[#161616] text-white hover:bg-[#333333] whitespace-nowrap shrink-0"
          >
            {t.returnTriageBtn}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`border p-5 ${
                step.active
                  ? 'border-[#E84A27] bg-[#FAF6F2]'
                  : 'border-[#DFDBD2] bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-[#E84A27]">{step.num}</span>
                <span className="text-[#5A5853] font-medium">{step.owner}</span>
              </div>
              <h3 className="text-base font-semibold text-[#161616]">{step.title}</h3>
              <p className="mt-2 text-xs text-[#44423D] leading-relaxed">{step.detail}</p>
              <p className="mt-3 pt-2 border-t border-[#DFDBD2] text-[11px] font-medium text-[#161616]">
                {step.scopeNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Proposed KPIs (Slide 17) + Session Telemetry */}
      <div className="border border-[#DFDBD2] bg-white p-6">
        <h3 className="text-sm font-semibold text-[#161616] mb-3">
          {isKo ? '제안된 핵심 성과 지표 (Slide 17) & 현재 세션 기록' : 'Proposed KPIs (Slide 17) & Session Telemetry'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#DFDBD2] bg-[#FAF8F5] p-4">
            <p className="text-xs font-medium text-[#E84A27]">
              {isKo ? 'KPI 01 · 검토 생산성' : 'KPI 01 · Review Productivity'}
            </p>
            <h4 className="text-sm font-semibold text-[#161616] mt-1">
              {isKo ? '검토 시간당 유효 리드 수' : 'Qualified leads per review hour'}
            </h4>
            <p className="text-xs text-[#5A5853] mt-1">
              {isKo
                ? '조사 착수된 고유 리스팅 수 ÷ 브랜드 보호 담당자 검토 시간'
                : 'Unique listings accepted for investigation ÷ staff review hours.'}
            </p>
          </div>
          <div className="border border-[#DFDBD2] bg-[#FAF8F5] p-4">
            <p className="text-xs font-medium text-[#E84A27]">
              {isKo ? 'KPI 02 · 잔존 노출률' : 'KPI 02 · Remaining Exposure'}
            </p>
            <h4 className="text-sm font-semibold text-[#161616] mt-1">
              {isKo ? '신고 7일 후 잔존 확인 리스팅 비율' : 'Confirmed listings still live at day 7'}
            </h4>
            <p className="text-xs text-[#5A5853] mt-1">
              {isKo
                ? '담당자 확인 및 신고 제출 후 7일 시점에도 온라인에 남아있는 리스팅 비중'
                : 'Share of staff-confirmed, reported listings still online seven days after submission.'}
            </p>
          </div>
          <div className="border border-[#DFDBD2] bg-[#FAF8F5] p-4">
            <p className="text-xs font-medium text-[#5A5853]">
              {isKo ? '현재 프로토타입 세션 요약' : 'Current Session Audit Summary'}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 font-mono tabular-nums">
              <div>
                <div className="text-lg font-bold text-[#161616]">{auditLogs.length}</div>
                <div className="text-[11px] text-[#5A5853]">{isKo ? '검토 완료' : 'Reviewed'}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#E84A27]">{approvedCount}</div>
                <div className="text-[11px] text-[#5A5853]">{isKo ? '신고 승인' : 'Approved'}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#161616]">{overrideCount}</div>
                <div className="text-[11px] text-[#5A5853]">{isKo ? 'AI 재정의' : 'Overrides'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 7 Transparency Table (Honest Status, No Peer Feedback Yet) */}
      <div className="border border-[#DFDBD2] bg-white p-6">
        <h3 className="text-sm font-semibold text-[#161616] mb-3">
          {isKo
            ? '과제 Part 7 투명성 점검: 구현 범위 vs. 시뮬레이션 vs. 미검증 항목'
            : 'Part 7 Transparency: Working vs. Simulated vs. Untested'}
        </h3>
        <div className="overflow-x-auto border border-[#DFDBD2]">
          <table className="w-full text-left border-collapse text-xs">
            <tbody className="divide-y divide-[#EAE6DD]">
              <tr>
                <th className="py-3 px-4 w-56 bg-[#FAF8F5] font-semibold text-[#161616] align-top">
                  {isKo ? '실제 동작·인터랙티브 영역' : 'Working / Interactive'}
                </th>
                <td className="py-3 px-4 text-[#44423D] leading-relaxed">
                  {isKo
                    ? '샘플 선택과 예시 결과 열기, 근거 검토·선택, 선택에 따른 초안 갱신, 담당자 결정과 스냅샷 기록을 시연합니다.'
                    : 'The demo shows case selection, prepared results, evidence review and selection, draft updates, and a human decision snapshot.'}
                </td>
              </tr>
              <tr>
                <th className="py-3 px-4 bg-[#FAF8F5] font-semibold text-[#161616] align-top">
                  {isKo ? '시뮬레이션·실험적 요소' : 'Simulated / Experimental'}
                </th>
                <td className="py-3 px-4 text-[#44423D] leading-relaxed">
                  {isKo
                    ? '시각 유사도, 기준가, 판매자 목록과 상표권은 모두 합성 자료입니다. AI 결과는 사례별로 미리 작성했습니다.'
                    : 'Visual similarity, reference prices, seller records and trademarks are synthetic. AI results are prepared for each case.'}
                </td>
              </tr>
              <tr>
                <th className="py-3 px-4 bg-[#FAF8F5] font-semibold text-[#161616] align-top">
                  {isKo ? '아직 검증되지 않은 항목' : 'Not Yet Proven'}
                </th>
                <td className="py-3 px-4 text-[#44423D] leading-relaxed">
                  {isKo
                    ? '타 그룹 피드백은 제공받아 반영했습니다. 개선 후 사용성 재평가, 실제 데이터의 정밀도·재현율, 플랫폼 신고 수용률은 아직 검증되지 않았습니다.'
                    : 'Feedback from another group has been incorporated. Post-change usability, real-world precision/recall and marketplace acceptance rates remain unvalidated.'}
                </td>
              </tr>
              <tr>
                <th className="py-3 px-4 bg-[#FAF8F5] font-semibold text-[#161616] align-top">
                  {isKo ? '필수 인간 검토·개입 지점' : 'Mandatory Human Oversight'}
                </th>
                <td className="py-3 px-4 text-[#44423D] leading-relaxed">
                  {isKo
                    ? '국가별 상표권 보호 범위 및 병행수입 법규 확인, 미등록 판매자의 적법한 중고 리셀 여부 판별, 누락/저신뢰도 증거 보완, 모든 침해 신고서의 최종 제출 승인.'
                    : 'Confirming regional trademark scope & grey-market rules, verifying lawful secondhand resellers, resolving incomplete evidence holds, and authorizing final takedown submissions.'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
