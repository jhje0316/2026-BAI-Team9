import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
} from 'lucide-react';
import type {
  AuditLogEntry,
  DecisionDriver,
  GenuineSkuReference,
  HumanActionType,
  EvidenceReview,
  Locale,
  RiskClassification,
  SuspectListingRecord,
  TriageEvaluation,
} from '../domain/types';
import {
  getClassificationLabel,
  getDecisionDriverOptions,
  getHumanActionLabel,
  getRecommendationLabel,
  getShortRiskLabel,
  UI_COPY,
  EVIDENCE_COPY,
} from '../i18n/translations';
import { buildReviewEvidence, createReportSnapshot, getDecisionGates } from '../domain/evidenceReview';
import { EvidenceReviewPanel } from './EvidenceReviewPanel';
import { ProductVisualComparison } from './ProductVisualComparison';
import { FeedbackHighlight } from '../../../../presentation/FeedbackHighlight';

interface TriageDetailWorkspaceProps {
  listing: SuspectListingRecord;
  skuRef: GenuineSkuReference;
  baselineEvaluation: TriageEvaluation;
  exampleSummary: string;
  locale: Locale;
  currentHumanAction: HumanActionType;
  auditLogs: AuditLogEntry[];
  onHumanDecision: (
    action: Exclude<HumanActionType, 'PENDING'>,
    driver: DecisionDriver,
    overrideNote: string,
    draftText: string,
    review: EvidenceReview,
    confirmed: boolean
  ) => void;
  onOpenPackageModal: (review: EvidenceReview) => void;
}

function getClassificationBannerStyle(classification: RiskClassification): {
  containerClass: string;
  textClass: string;
} {
  switch (classification) {
    case 'HIGH_RISK':
      return {
        containerClass: 'border-[#B91C1C] bg-[#FEF2F2]',
        textClass: 'text-[#991B1B]',
      };
    case 'MEDIUM_RISK':
      return {
        containerClass: 'border-[#B45309] bg-[#FFFBEB]',
        textClass: 'text-[#92400E]',
      };
    case 'LOW_RISK':
      return {
        containerClass: 'border-[#15803D] bg-[#F0FDF4]',
        textClass: 'text-[#166534]',
      };
    case 'HOLD_MISSING_DATA':
      return {
        containerClass: 'border-[#B91C1C] bg-[#FEF2F2]',
        textClass: 'text-[#991B1B]',
      };
  }
}

function getDefaultDriverForEvaluation(evaluation: TriageEvaluation): DecisionDriver {
  if (!evaluation.mandatoryAudit.valid) return 'MISSING_AUDIT_DATA';
  if (evaluation.isLegitimateResaleContext) return 'RESALE_CONTEXT';
  if (evaluation.classification === 'LOW_RISK') return 'AUTHORIZED_WHITELIST';
  if (evaluation.suspiciousKeywords.length > 0) return 'REPLICA_KEYWORDS';
  if (evaluation.priceDeviationPct <= -60) return 'PRICE_ANOMALY';
  return 'VISUAL_MISMATCH';
}

export function TriageDetailWorkspace({
  listing,
  skuRef,
  baselineEvaluation,
  exampleSummary,
  locale,
  currentHumanAction,
  auditLogs,
  onHumanDecision,
  onOpenPackageModal,
}: TriageDetailWorkspaceProps) {
  const t = UI_COPY[locale];
  const isKo = locale === 'ko';
  const activeEvaluation = baselineEvaluation;
  const et = EVIDENCE_COPY[locale];
  const [review, setReview] = useState<EvidenceReview>({});
  const [confirmed, setConfirmed] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const items = buildReviewEvidence(listing, skuRef, baselineEvaluation, locale);

  const [showThresholdRubric, setShowThresholdRubric] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const snapshot = createReportSnapshot(listing.id, items, review, locale);
  const draftText = snapshot.text;
  const [overrideNote, setOverrideNote] = useState('');
  const [decisionDriver, setDecisionDriver] = useState<DecisionDriver>(
    getDefaultDriverForEvaluation(activeEvaluation)
  );
  useEffect(() => {
    setOverrideNote('');
    setConfirmed(false);
    setRecorded(false);
  }, [locale]);

  const bannerStyle = getClassificationBannerStyle(activeEvaluation.classification);
  const bannerLabel = getClassificationLabel(activeEvaluation.classification, locale);
  const driverOptions = getDecisionDriverOptions(locale);

  const productName = isKo ? skuRef.productNameKo : skuRef.productName;
  const officialCopy = isKo ? skuRef.officialCopyKo : skuRef.officialCopy;
  const countryName = isKo ? listing.targetCountryNameKo : listing.targetCountryName;
  const visualObs = isKo ? listing.visualObservationKo : listing.visualObservation;

  const highlightSuspiciousTerms = (text: string) => {
    if (activeEvaluation.suspiciousKeywords.length === 0) return text;
    const escaped = activeEvaluation.suspiciousKeywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      activeEvaluation.suspiciousKeywords.some(
        (k) => k.toLowerCase() === part.toLowerCase()
      ) ? (
        <mark key={idx} className="bg-[#FEE2E2] text-[#991B1B] px-1 font-medium">
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  const gates = getDecisionGates({ evaluation: activeEvaluation, items, review, confirmed, rationale: overrideNote, draft: draftText, caseId: listing.id, locale });
  const changeReview = (next: EvidenceReview) => { setReview(next); setConfirmed(false); setRecorded(false); };
  const decide = (action: Exclude<HumanActionType, 'PENDING'>) => {
    if (!gates.canRecord || (action === 'APPROVED_TAKEDOWN' && !gates.canApproveTakedown)) return;
    onHumanDecision(action, decisionDriver, overrideNote, draftText, review, confirmed);
    setRecorded(true);
  };


  return (
    <div className="w-full flex-1 min-w-0 space-y-5">
      <article className="border border-[#DFDBD2] bg-white">
        {/* Card Header: Unboxed Metadata & Classification Verdict */}
        <div className="px-6 py-4 border-b border-[#DFDBD2]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[#5A5853]">
                <span className="font-mono font-semibold">{listing.id}</span> · {countryName} · {listing.marketplace}
              </p>
              <h2 className="mt-1 text-lg font-bold">{productName}</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowExample(visible => !visible)}
              aria-expanded={showExample}
              aria-controls="prepared-ai-result"
              className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#182d2e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#294746]"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              {showExample
                ? (isKo ? '예시 AI 결과 접기' : 'Hide sample AI result')
                : (isKo ? '예시 AI 결과 보기' : 'Show sample AI result')}
            </button>
          </div>

          <div className={`peer-feedback-region border px-4 py-3 ${bannerStyle.containerClass}`}>
            <FeedbackHighlight topic="risk" locale={locale} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                {activeEvaluation.isApprovalLocked && (
                  <Lock className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
                )}
                <h2 className={`text-sm font-bold tracking-normal ${bannerStyle.textClass}`}>
                  {bannerLabel}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowThresholdRubric((prev) => !prev)}
                aria-expanded={showThresholdRubric}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#161616] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                {t.thresholdRubric}
                {showThresholdRubric ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            <p className="mt-1 text-xs text-[#44423D]">
              {et.aiRecommendation} · <strong>{getRecommendationLabel(activeEvaluation.recommendedAction, locale)}</strong>
            </p>

            {showThresholdRubric && (
              <p className="mt-2 pt-2 border-t border-black/10 text-xs text-[#161616] leading-relaxed">
                {activeEvaluation.thresholdExplanation}
              </p>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3 rounded-md bg-[#F7F5F0] px-3 py-2.5 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] text-[#5A5853]">{isKo ? '판매가 / 기준가' : 'Listing / reference price'}</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                {listing.currency}{listing.listedPrice} / {listing.currency}{listing.officialMsrp}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#5A5853]">{isKo ? '레플리카 문구' : 'Replica wording'}</dt>
              <dd className="mt-0.5 break-words text-sm font-semibold">
                {activeEvaluation.suspiciousKeywords[0] ?? (isKo ? '표시된 문구 없음' : 'None flagged')}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#5A5853]">{isKo ? '시뮬레이션 유사도' : 'Simulated similarity'}</dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold">{listing.visualSimilarityScore.toFixed(2)}</dd>
            </div>
          </dl>

          <div id="prepared-ai-result" hidden={!showExample} data-testid="prepared-ai-result"
            className="mt-3 rounded-md border border-[#C5D7D0] bg-[#F0F6F3] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#245247]">{isKo ? '사전 작성된 예시 AI 결과' : 'Prepared sample AI result'}</h3>
            <p className="mt-1 text-sm leading-relaxed">{exampleSummary}</p>
          </div>

          {activeEvaluation.isLegitimateResaleContext && (
            <p data-testid="resale-context-indicator" className="mt-3 flex items-start gap-2 text-xs text-[#166534]">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              {isKo ? '정상 중고 재판매 단서 · 판매자 미등록은 참고 정보' : 'Lawful resale cues · Unlisted seller status is contextual'}
            </p>
          )}

          {!activeEvaluation.mandatoryAudit.valid && (
            <div data-testid="missing-evidence-warning" className="mt-3 flex items-start gap-2 rounded-md border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-xs text-[#991B1B]">
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{t.lockBannerTitle}</p>
                <ul className="mt-1 list-disc list-inside">
                  {activeEvaluation.mandatoryAudit.reasons.map(reason => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Visual Comparison Section */}
        <div className="peer-feedback-region px-6 py-4 border-b border-[#DFDBD2]">
          <FeedbackHighlight topic="visual" locale={locale} />
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h3 className="text-xs font-semibold text-[#5A5853]">
              {t.sectionVisualHeading}
            </h3>
          </div>
          <ProductVisualComparison
            sku={skuRef.sku}
            productName={productName}
            visualMode={listing.visualMode}
            similarityScore={listing.visualSimilarityScore}
            observation={visualObs}
            locale={locale}
            hideRawScore={false}
          />
        </div>

        {/* Side-by-Side Structured Evidence Table with Data-Curation Origins & Limitations */}
        <details className="px-6 py-4 border-b border-[#DFDBD2]">
          <summary className="cursor-pointer text-xs font-semibold text-[#5A5853] mb-2.5">{t.sectionEvidenceHeading}</summary>

          <div className="overflow-x-auto border border-[#DFDBD2]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#DFDBD2] text-xs font-semibold text-[#5A5853]">
                  <th className="py-2.5 px-3 w-44">{t.colDimension}</th>
                  <th className="py-2.5 px-3">{t.colExternal}</th>
                  <th className="py-2.5 px-3">{t.colInternal}</th>
                  <th className="py-2.5 px-3 w-24 text-right">{t.colCheck}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DD]">
                <tr>
                  <td className="py-3 px-3 align-top text-xs font-medium text-[#161616]">
                    {activeEvaluation.evidenceChecks[1]?.label}
                    <div className="text-[11px] font-normal text-[#5A5853] mt-0.5 font-mono">
                      {activeEvaluation.evidenceChecks[1]?.originTag} · NLP
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-[#161616]">
                      {highlightSuspiciousTerms(listing.listingTitle)}
                    </p>
                    {isKo && listing.listingTitleKo && (
                      <p className="text-xs text-[#5A5853] mt-0.5">
                        ({listing.listingTitleKo})
                      </p>
                    )}
                    <p className="text-xs text-[#5A5853] mt-1 leading-relaxed">
                      {highlightSuspiciousTerms(listing.listingDescription)}
                    </p>
                    {isKo && listing.listingDescriptionKo && (
                      <p className="text-xs text-[#5A5853] mt-0.5">
                        ({listing.listingDescriptionKo})
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-[#5A5853] mt-1">
                      {t.searchQueryPrefix} {listing.approvedSearchQuery}
                    </p>
                    <p className="text-[11px] text-[#5A5853] mt-1">
                      {activeEvaluation.evidenceChecks[1]?.curationLimitation}
                    </p>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-[#161616]">{productName}</p>
                    <p className="text-xs text-[#5A5853] mt-1 leading-relaxed">
                      {officialCopy}
                    </p>
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono text-xs font-semibold">
                    <span
                      className={
                        activeEvaluation.evidenceChecks[1]?.status === 'FAIL'
                          ? 'text-[#B91C1C]'
                          : 'text-[#15803D]'
                      }
                    >
                      {activeEvaluation.evidenceChecks[1]?.status}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 align-top text-xs font-medium text-[#161616]">
                    {activeEvaluation.evidenceChecks[2]?.label}
                    <div className="text-[11px] font-normal text-[#5A5853] mt-0.5 font-mono">
                      {activeEvaluation.evidenceChecks[2]?.originTag} · ERP
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="font-mono tabular-nums">
                      <span className="font-semibold text-[#161616]">
                        {listing.currency}
                        {listing.listedPrice.toLocaleString()}
                      </span>{' '}
                      <span className="text-xs text-[#5A5853]">
                        ({activeEvaluation.priceDeviationPct}% · Condition: {listing.condition})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A5853] mt-1">
                      {activeEvaluation.evidenceChecks[2]?.curationLimitation}
                    </p>
                  </td>
                  <td className="py-3 px-3 align-top font-mono tabular-nums text-[#161616]">
                    {listing.currency}
                    {listing.officialMsrp.toLocaleString()} ({listing.targetCountryCode} {t.officialMsrpSuffix})
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono text-xs font-semibold">
                    <span
                      className={
                        activeEvaluation.evidenceChecks[2]?.status === 'FAIL'
                          ? 'text-[#B91C1C]'
                          : activeEvaluation.evidenceChecks[2]?.status === 'WARN'
                            ? 'text-[#B45309]'
                            : 'text-[#15803D]'
                      }
                    >
                      {activeEvaluation.evidenceChecks[2]?.status}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 align-top text-xs font-medium text-[#161616]">
                    {activeEvaluation.evidenceChecks[3]?.label}
                    <div className="text-[11px] font-normal text-[#5A5853] mt-0.5 font-mono">
                      {activeEvaluation.evidenceChecks[3]?.originTag} · IP Audit
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top text-xs">
                    <span className="font-mono font-medium text-[#161616]">
                      {listing.sellerId ?? 'MISSING / NULL'}
                    </span>{' '}
                    <span className="text-[#5A5853]">
                      · {t.authorizationPrefix} {listing.sellerStatus}
                    </span>
                    <p className="text-[11px] text-[#5A5853] mt-1">
                      {activeEvaluation.evidenceChecks[3]?.curationLimitation}
                    </p>
                  </td>
                  <td className="py-3 px-3 align-top text-xs">
                    <span className="font-mono font-medium text-[#161616]">
                      {skuRef.rightsRecordId}
                    </span>{' '}
                    <span className="text-[#5A5853]">
                      · {listing.targetCountryCode} {t.tmPrefix} {listing.trademarkStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-right font-mono text-xs font-semibold">
                    <span
                      className={
                        activeEvaluation.evidenceChecks[3]?.status === 'FAIL'
                          ? 'text-[#B91C1C]'
                          : activeEvaluation.evidenceChecks[3]?.status === 'WARN'
                            ? 'text-[#B45309]'
                            : 'text-[#15803D]'
                      }
                    >
                      {activeEvaluation.evidenceChecks[3]?.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <EvidenceReviewPanel items={items} review={review} locale={locale} onChange={changeReview} />

        {/* Draft Takedown Report & Human Decision Controls */}
        <div className="peer-feedback-region px-6 py-4 space-y-4">
          <FeedbackHighlight topic="draft" locale={locale} />
          <div className="flex items-center justify-between">
            <label
              htmlFor="draft-takedown-textarea"
              className="text-xs font-semibold text-[#5A5853]"
            >
              {t.sectionDraftHeading}
            </label>
            {snapshot.selectedEvidenceIds.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenPackageModal(review)}
                className="text-xs font-medium text-[#E84A27] hover:underline whitespace-nowrap shrink-0"
              >
                {t.previewPackageBtn}
              </button>
            )}
          </div>

          <ul className="flex flex-wrap gap-2 text-xs" aria-label={isKo ? '초안에 포함된 근거' : 'Evidence in draft'}>
            {snapshot.selectedEvidenceIds.length > 0
              ? items.filter(item => snapshot.selectedEvidenceIds.includes(item.id)).map(item => (
                <li key={item.id} className="rounded-full bg-[#E9F3EF] px-2.5 py-1 font-medium text-[#245247]">{item.name}</li>
              ))
              : <li className="text-[#5A5853]">{et.noSelection}</li>}
          </ul>
          <textarea
            id="draft-takedown-textarea"
            rows={8}
            value={draftText}
            readOnly
            data-testid="report-draft"
            className="w-full border border-[#CFCAC0] bg-white px-3 py-2.5 text-sm text-[#161616] leading-relaxed disabled:bg-[#F3F1EC] disabled:text-[#5A5853]"
          />

          <label className="flex items-start gap-2 text-xs"><input type="checkbox" data-testid="confirm-evidence" checked={confirmed} onChange={e => { setConfirmed(e.target.checked); setRecorded(false); }} />{et.confirmation}</label>
          {!gates.canRecord && <p className="text-xs text-[#5A5853]">{et.gates}</p>}
          {recorded && <p role="status" className="text-xs text-[#166534]">{et.saved}</p>}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2 border-t border-[#EAE6DD]">
            <div className="md:col-span-3">
              <label htmlFor="decision-driver" className="block text-xs font-medium text-[#161616] mb-1">
                {t.driverLabel}
              </label>
              <select
                id="decision-driver"
                value={decisionDriver}
                onChange={(e) => setDecisionDriver(e.target.value as DecisionDriver)}
                className="w-full border border-[#CFCAC0] bg-white px-2.5 py-2 text-xs text-[#161616]"
              >
                {driverOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="override-note" className="block text-xs font-medium text-[#161616] mb-1">
                {t.overrideNoteLabel}
              </label>
              <input
                id="override-note"
                type="text"
                value={overrideNote}
                onChange={(e) => { setOverrideNote(e.target.value); setRecorded(false); }}
                required
                placeholder={t.overrideNotePlaceholder}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-xs text-[#161616]"
              />
            </div>

            <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={!gates.canRecord}
                onClick={() => decide('DISMISSED_LEGITIMATE')}
                className={`px-3.5 py-2 text-xs font-medium border whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentHumanAction === 'DISMISSED_LEGITIMATE'
                    ? 'border-[#15803D] bg-[#F0FDF4] text-[#166534]'
                    : 'border-[#CFCAC0] bg-white text-[#161616] hover:bg-[#FAF8F5]'
                }`}
              >
                {t.btnDismiss}
              </button>

              <button
                type="button"
                disabled={!gates.canRecord}
                onClick={() => decide('HOLD_VERIFICATION')}
                className={`px-3.5 py-2 text-xs font-medium border whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentHumanAction === 'HOLD_VERIFICATION'
                    ? 'border-[#B45309] bg-[#FFFBEB] text-[#92400E]'
                    : 'border-[#CFCAC0] bg-white text-[#161616] hover:bg-[#FAF8F5]'
                }`}
              >
                {t.btnHold}
              </button>

              <button
                type="button"
                disabled={!gates.canRecord || !gates.canApproveTakedown}
                title={activeEvaluation.lockReason ?? t.btnApprove}
                onClick={() => decide('APPROVED_TAKEDOWN')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#E84A27] text-white hover:bg-[#D13D1C] disabled:bg-[#D4CFC7] disabled:text-[#5A5853] disabled:cursor-not-allowed whitespace-nowrap shrink-0 transition-colors"
              >
                {activeEvaluation.isApprovalLocked && (
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {t.btnApprove}
              </button>
            </div>
          </div>

          <p className="text-xs text-[#5A5853]">
            {isKo ? '신고 승인 잠금 · 독립적으로 확인한 권리·진위 자료가 필요합니다.' : 'Report approval is locked pending independent evidence of rights and authenticity.'}
          </p>
        </div>
      </article>

      {/* Session Human Audit Trail */}
      <section className="border border-[#DFDBD2] bg-white">
        <div className="px-6 py-3 border-b border-[#DFDBD2] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#161616]">{t.auditHeading}</h3>
          <span className="text-xs font-mono tabular-nums text-[#5A5853]">
            {auditLogs.length} {t.auditRecordedSuffix}
          </span>
        </div>
        {auditLogs.length === 0 ? (
          <div className="px-6 py-5 text-xs text-[#5A5853]">{t.auditEmpty}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs [&_td]:align-top">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#DFDBD2] text-[#5A5853]">
                  <th className="py-2 px-4">{t.auditColCase}</th>
                  <th className="py-2 px-4">{t.auditColAi}</th>
                  <th className="py-2 px-4">{t.auditColHuman}</th>
                  <th className="py-2 px-4">{t.auditColDriver}</th>
                  <th className="py-2 px-4">{t.auditColOverride}</th>
                  <th className="py-2 px-4">{t.auditColNote}</th>
                  <th className="py-2 px-4 text-right">{t.auditColTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DD]">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-4 font-mono font-medium text-[#161616]">
                      {log.caseId}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5A5853]">
                      {getShortRiskLabel(log.aiClassification, locale)}<br />{getRecommendationLabel(log.aiRecommendation, locale)}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[#161616]">
                      {getHumanActionLabel(log.humanAction, locale)}
                    </td>
                    <td className="py-2.5 px-4 text-[#161616]">
                      {driverOptions.find((d) => d.value === log.decisionDriver)?.label ??
                        log.decisionDriver}
                    </td>
                    <td className="py-2.5 px-4">
                      {log.overrodeAi ? (
                        <span className="font-medium text-[#E84A27]">{t.overrideYes}</span>
                      ) : (
                        <span className="text-[#5A5853]">{t.overrideNo}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[#5A5853]">{log.note}
                      <details className="mt-2"><summary className="cursor-pointer">{et.snapshot}</summary>
                        <p>{log.selectedEvidenceIds.join(', ')}</p>
                        <p>{log.draftSnapshot.version}</p>
                        <ul>{log.evidenceStates.map(item => <li key={item.id}>{item.id}: {item.review === 'reviewed' ? et.reviewed : isKo ? '미검토' : 'Unreviewed'} · {item.included ? et.include : isKo ? '제외' : 'Excluded'} · {item.verification === 'untrusted_ai' ? et.untrusted : et.unverified}</li>)}</ul>
                        <pre className="whitespace-pre-wrap min-w-64 max-w-lg text-xs mt-2">{log.draftSnapshot.text}</pre>
                      </details>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#5A5853] break-all min-w-28">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
