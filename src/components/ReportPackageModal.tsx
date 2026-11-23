import { useState } from 'react';
import { Check, Copy, FileText, X } from 'lucide-react';
import type {
  GenuineSkuReference,
  Locale,
  SuspectListingRecord,
  TriageEvaluation,
} from '../domain/types';

interface ReportPackageModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  listing: SuspectListingRecord;
  skuRef: GenuineSkuReference;
  evaluation: TriageEvaluation;
  draftText: string;
}

export function ReportPackageModal({
  isOpen,
  locale,
  onClose,
  listing,
  skuRef,
  evaluation,
  draftText,
}: ReportPackageModalProps) {
  const [copied, setCopied] = useState(false);
  const isKo = locale === 'ko';

  if (!isOpen) return null;

  const productName = isKo ? skuRef.productNameKo : skuRef.productName;
  const countryName = isKo ? listing.targetCountryNameKo : listing.targetCountryName;
  const visualObs = isKo ? listing.visualObservationKo : listing.visualObservation;

  const fullPackageText = [
    `AJOU BRAND PROTECTION — PLATFORM TAKEDOWN PACKAGE`,
    `Case ID: ${listing.id} | Market: ${countryName} (${listing.targetCountryCode})`,
    `Marketplace: ${listing.marketplace} | Capture UTC: ${listing.captureTimestamp ?? 'N/A'}`,
    ``,
    `1. COMPARISON SHEET`,
    `- Genuine SKU: ${skuRef.sku} (${productName})`,
    `- Flagged Title: ${listing.listingTitle}`,
    `- Price Deviation: ${listing.currency}${listing.listedPrice} vs. Official MSRP ${listing.currency}${listing.officialMsrp} (${evaluation.priceDeviationPct}%)`,
    `- Visual Observation: ${visualObs}`,
    ``,
    `2. ORIGINAL PROOF OF RIGHTS`,
    `- Trademark Registry ID: ${skuRef.rightsRecordId}`,
    `- Jurisdiction Status: ${listing.targetCountryCode} (${listing.trademarkStatus})`,
    ``,
    `3. INFRINGEMENT REPORT STATEMENT`,
    draftText,
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPackageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-package-title"
    >
      <div className="w-full max-w-2xl bg-white border border-[#161616] max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#DFDBD2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#E84A27]" aria-hidden="true" />
            <h2 id="report-package-title" className="text-base font-semibold text-[#161616]">
              {isKo ? '3종 신고 패키지 미리보기 (Slide 14)' : 'Prepared 3-Document Report Package'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isKo ? '신고 패키지 모달 닫기' : 'Close report package modal'}
            className="p-2 text-[#5A5853] hover:text-[#161616] focus-visible:outline-2 focus-visible:outline-[#E84A27]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-[#5A5853]">
            {isKo
              ? '담당자 최종 확인용으로 편성된 패키지입니다. 실제 플랫폼 자동 제출은 본 프로토타입 범위에서 제외되어 있습니다.'
              : 'Generated for human sign-off (Mid-term Slide 14 workflow). External submission remains manual; no automated platform filing occurs in this prototype.'}
          </p>

          <section className="border border-[#DFDBD2] p-4 bg-[#FAF8F5]">
            <h3 className="text-xs font-semibold text-[#5A5853] mb-2">
              {isKo ? '01. 비교 시트 (Comparison Sheet)' : '01. Comparison Sheet'}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-[#5A5853]">{isKo ? '의심 리스팅' : 'Flagged Listing'}</dt>
                <dd className="font-medium text-[#161616]">{listing.listingTitle}</dd>
              </div>
              <div>
                <dt className="text-[#5A5853]">{isKo ? '매칭 공식 SKU' : 'Genuine SKU Match'}</dt>
                <dd className="font-medium text-[#161616] font-mono tabular-nums">
                  {skuRef.sku} · {productName}
                </dd>
              </div>
              <div>
                <dt className="text-[#5A5853]">{isKo ? '가격 편차' : 'Price Deviation'}</dt>
                <dd className="font-mono tabular-nums font-medium text-[#B91C1C]">
                  {listing.currency}{listing.listedPrice} vs. {listing.currency}{listing.officialMsrp} ({evaluation.priceDeviationPct}%)
                </dd>
              </div>
              <div>
                <dt className="text-[#5A5853]">{isKo ? '채증 시각 (UTC)' : 'Capture Audit UTC'}</dt>
                <dd className="font-mono tabular-nums text-[#161616]">
                  {listing.captureTimestamp ?? 'Missing'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-[#DFDBD2] p-4 bg-[#FAF8F5]">
            <h3 className="text-xs font-semibold text-[#5A5853] mb-2">
              {isKo ? '02. 원 권리 증빙 (Original Proof of Rights)' : '02. Original Proof of Rights'}
            </h3>
            <p className="text-xs text-[#161616]">
              {isKo ? '권리 등록 번호' : 'Rights Record'}:{' '}
              <span className="font-mono font-medium">{skuRef.rightsRecordId}</span> ·{' '}
              {isKo ? '관할 시장' : 'Jurisdiction'}:{' '}
              <span className="font-medium">{countryName} ({listing.targetCountryCode})</span> ·{' '}
              {isKo ? '상표권 상태' : 'Registry Status'}:{' '}
              <span className="font-medium text-[#15803D]">{listing.trademarkStatus}</span>
            </p>
          </section>

          <section className="border border-[#DFDBD2] p-4 bg-white">
            <h3 className="text-xs font-semibold text-[#5A5853] mb-2">
              {isKo ? '03. 침해 신고서 본문 (Infringement Report)' : '03. Infringement Report Statement'}
            </h3>
            <p className="text-sm text-[#161616] leading-relaxed whitespace-pre-wrap">
              {draftText}
            </p>
          </section>

          <div className="pt-3 border-t border-[#DFDBD2] flex items-center justify-between gap-3">
            <span className="text-xs text-[#5A5853]">
              {isKo ? '승인 내역이 세션 감사 로그에 기록되었습니다.' : 'Human approval recorded in session audit log.'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[#161616] text-[#161616] hover:bg-[#FAF8F5] whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    {isKo ? '패키지 복사 완료' : 'Copied Package'}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    {isKo ? '신고 패키지 복사' : 'Copy Report Text'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium bg-[#161616] text-white hover:bg-[#333333] whitespace-nowrap shrink-0"
              >
                {isKo ? '닫기' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
