import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { preparedTriage } from '../domain/preparedTriage';
import type { AuditLogEntry, Locale, SuspectListingRecord } from '../domain/types';
import { getShortRiskLabel, UI_COPY } from '../i18n/translations';

interface SampleDatasetViewProps {
  cases: SuspectListingRecord[];
  auditLogs: AuditLogEntry[];
  locale: Locale;
  onSelectCaseInWorkspace: (id: string) => void;
  onBackToTriage: () => void;
}

export function SampleDatasetView({
  cases,
  auditLogs,
  locale,
  onSelectCaseInWorkspace,
  onBackToTriage,
}: SampleDatasetViewProps) {
  const [copiedType, setCopiedType] = useState<'dataset' | 'audit' | null>(null);
  const isKo = locale === 'ko';
  const t = UI_COPY[locale];

  const handleCopyMarkdownDataset = async () => {
    const header =
      '| Listing_ID (Synthetic) | Matched_SKU & Market | Title / Text | Price vs. MSRP | Seller_Status | Visual_Match / Metadata | Expected Output |\n|---|---|---|---|---|---|---|';
    const rows = cases.map((c) => {
      const { evaluation: evalRes } = preparedTriage(c.id, locale);
      return `| ${c.id} | ${c.matchedSku} (${c.targetCountryCode}) | ${c.listingTitle} | ${c.currency}${c.listedPrice} vs. ${c.currency}${c.officialMsrp} (${evalRes.priceDeviationPct}%) | ${c.sellerStatus} (${c.sellerId ?? 'NULL'}) | ${c.visualSimilarityScore.toFixed(2)}; TM: ${c.trademarkStatus}; TS: ${c.captureTimestamp ?? 'MISSING'} | ${evalRes.classification} |`;
    });
    try {
      await navigator.clipboard.writeText([header, ...rows].join('\n'));
      setCopiedType('dataset');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setCopiedType(null);
    }
  };

  const handleCopyAuditJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(auditLogs, null, 2));
      setCopiedType('audit');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setCopiedType(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border border-[#DFDBD2] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#DFDBD2]">
          <div>
            <p className="text-xs font-medium text-[#E84A27]">
              {isKo
                ? '과제 Part 4 & 제출물 #3 · 가상의 합성 레코드 전용'
                : 'Assignment Part 4 & Deliverable #3 · Fictional / Synthetic Records Only'}
            </p>
            <h2 className="text-xl font-bold text-[#161616] mt-1">
              {isKo
                ? 'AJOU 데이터 큐레이션 연동 합성 샘플 데이터셋'
                : 'AJOU Synthetic Sample Dataset & Export'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyMarkdownDataset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#161616] text-[#161616] hover:bg-[#FAF8F5] whitespace-nowrap"
            >
              {copiedType === 'dataset' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                  {isKo ? '마크다운 표 복사됨' : 'Copied Table'}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  {isKo ? '과제 제출용 표 복사' : 'Copy Dataset Table'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBackToTriage}
              className="px-4 py-2 text-xs font-medium bg-[#161616] text-white hover:bg-[#333333] whitespace-nowrap"
            >
              {t.returnTriageBtn}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-[#5A5853] leading-relaxed">
          {isKo
            ? '본 레코드들은 실제 고객·직원·기밀 기업 정보를 포함하지 않는 합성 데이터입니다. 클릭하면 해당 케이스의 트리아지 화면으로 바로 이동합니다.'
            : 'All records below are fictional/synthetic test fixtures containing zero confidential company or personal data. Select any row to inspect it in the triage card.'}
        </p>

        <div className="mt-4 overflow-x-auto border border-[#DFDBD2]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#DFDBD2] text-[#5A5853]">
                <th className="py-2.5 px-3">Listing_ID (Synthetic)</th>
                <th className="py-2.5 px-3">{isKo ? '시나리오 / 데모' : 'Scenario'}</th>
                <th className="py-2.5 px-3">{isKo ? 'SKU & 시장' : 'SKU & Market'}</th>
                <th className="py-2.5 px-3">{isKo ? '제목' : 'Title'}</th>
                <th className="py-2.5 px-3">{isKo ? '가격 vs MSRP' : 'Price vs MSRP'}</th>
                <th className="py-2.5 px-3">{isKo ? '판매자 / 상표권 / 시각' : 'Seller / TM / Timestamp'}</th>
                <th className="py-2.5 px-3 text-right">{isKo ? '기대 판정' : 'Expected Verdict'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DD]">
              {cases.map((c) => {
                const { evaluation: evalRes } = preparedTriage(c.id, locale);
                return (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-mono font-medium text-[#161616]">
                      <button
                        type="button"
                        onClick={() => onSelectCaseInWorkspace(c.id)}
                        className="text-[#E84A27] hover:underline font-mono font-semibold"
                      >
                        {c.id}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-[#161616]">
                      {isKo ? c.scenarioLabelKo : c.scenarioLabel}
                      {c.demoOrder ? (
                        <span className="block font-mono text-[11px] text-[#E84A27]">
                          {t.demoTagPrefix} #{c.demoOrder}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#5A5853]">
                      {c.matchedSku} ({c.targetCountryCode})
                    </td>
                    <td className="py-3 px-3 text-[#161616] max-w-xs">
                      {c.listingTitle}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-[#161616]">
                      {c.currency}{c.listedPrice.toLocaleString()} / {c.currency}{c.officialMsrp.toLocaleString()} ({evalRes.priceDeviationPct}%)
                    </td>
                    <td className="py-3 px-3 text-[#5A5853] font-mono">
                      <div>Seller: {c.sellerId ?? 'NULL'} ({c.sellerStatus})</div>
                      <div>TM: {c.trademarkStatus} · CV: {c.visualSimilarityScore.toFixed(2)}</div>
                      <div>TS: {c.captureTimestamp ?? 'MISSING'}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#161616]">
                      {getShortRiskLabel(evalRes.classification, locale)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 pt-4 border-t border-[#DFDBD2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-[#5A5853]">
            {isKo
              ? `현재 세션 의사결정 로그 ${auditLogs.length}건을 JSON으로 내보낼 수 있습니다.`
              : `Export ${auditLogs.length} session audit decision(s) as JSON for evaluation records.`}
          </div>
          <button
            type="button"
            onClick={handleCopyAuditJson}
            disabled={auditLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#CFCAC0] text-[#161616] hover:bg-[#FAF8F5] disabled:opacity-40 whitespace-nowrap"
          >
            {copiedType === 'audit' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                {isKo ? '세션 로그 복사됨' : 'Copied Audit JSON'}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                {isKo ? '세션 감사 로그 JSON 복사' : 'Copy Session Audit JSON'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
