import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Lock,
  Sparkles,
  Unlock,
} from 'lucide-react';
import type {
  AiExperimentNote,
  AuditLogEntry,
  DecisionDriver,
  GenuineSkuReference,
  HumanActionType,
  Locale,
  RiskClassification,
  SuspectListingRecord,
  TrademarkStatus,
  TriageEvaluation,
} from '../domain/types';
import {
  getClassificationLabel,
  getDecisionDriverOptions,
  getHumanActionLabel,
  getShortRiskLabel,
  UI_COPY,
} from '../i18n/translations';
import { ProductVisualComparison } from './ProductVisualComparison';
import { FeedbackHighlight } from '../../../../presentation/FeedbackHighlight';

interface TriageDetailWorkspaceProps {
  listing: SuspectListingRecord;
  skuRef: GenuineSkuReference;
  baselineEvaluation: TriageEvaluation;
  liveEvaluation: TriageEvaluation | null;
  experimentNotes: AiExperimentNote[];
  locale: Locale;
  hideRawScore: boolean;
  currentHumanAction: HumanActionType;
  auditLogs: AuditLogEntry[];
  isAnalyzingLive: boolean;
  liveError: string | null;
  onLocaleChange: (locale: Locale) => void;
  onToggleBlindScore: (hide: boolean) => void;
  onRunLiveGemini: () => void;
  onSaveExperimentNote: (
    issueType: AiExperimentNote['issueType'],
    note: string
  ) => void;
  onCompleteMissingFields: (updates: {
    sellerId: string;
    captureTimestamp: string;
    trademarkStatus: TrademarkStatus;
  }) => void;
  onHumanDecision: (
    action: Exclude<HumanActionType, 'PENDING'>,
    driver: DecisionDriver,
    overrideNote: string,
    draftText: string
  ) => void;
  onOpenPackageModal: (draftText: string) => void;
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
  liveEvaluation,
  experimentNotes,
  locale,
  hideRawScore,
  currentHumanAction,
  auditLogs,
  isAnalyzingLive,
  liveError,
  onLocaleChange,
  onToggleBlindScore,
  onRunLiveGemini,
  onSaveExperimentNote,
  onCompleteMissingFields,
  onHumanDecision,
  onOpenPackageModal,
}: TriageDetailWorkspaceProps) {
  const t = UI_COPY[locale];
  const isKo = locale === 'ko';
  const activeEvaluation = liveEvaluation ?? baselineEvaluation;

  const [showThresholdRubric, setShowThresholdRubric] = useState(false);
  const [draftText, setDraftText] = useState(activeEvaluation.draftTakedownSummary);
  const [overrideNote, setOverrideNote] = useState('');
  const [decisionDriver, setDecisionDriver] = useState<DecisionDriver>(
    getDefaultDriverForEvaluation(activeEvaluation)
  );
  const [sellerInput, setSellerInput] = useState(listing.sellerId ?? 'LojaSul_BR');
  const [timestampInput, setTimestampInput] = useState(
    listing.captureTimestamp ?? '2026-11-19T14:30:00Z'
  );
  const [tmInput, setTmInput] = useState<TrademarkStatus>(listing.trademarkStatus);
  const [expIssueType, setExpIssueType] = useState<AiExperimentNote['issueType']>('NONE');
  const [expNoteText, setExpNoteText] = useState('');

  useEffect(() => {
    setDraftText(activeEvaluation.draftTakedownSummary);
    setOverrideNote('');
    setDecisionDriver(getDefaultDriverForEvaluation(activeEvaluation));
    setSellerInput(listing.sellerId ?? 'LojaSul_BR');
    setTimestampInput(listing.captureTimestamp ?? '2026-11-19T14:30:00Z');
    setTmInput(listing.trademarkStatus);
    setExpIssueType('NONE');
    setExpNoteText('');
  }, [
    listing.id,
    locale,
    activeEvaluation.draftTakedownSummary,
    listing.sellerId,
    listing.captureTimestamp,
    listing.trademarkStatus,
  ]);

  const bannerStyle = getClassificationBannerStyle(activeEvaluation.classification);
  const bannerLabel = getClassificationLabel(activeEvaluation.classification, locale);
  const driverOptions = getDecisionDriverOptions(locale);

  const productName = isKo ? skuRef.productNameKo : skuRef.productName;
  const silhouetteNote = isKo ? skuRef.silhouetteNoteKo : skuRef.silhouetteNote;
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

  const caseExperimentNotes = experimentNotes.filter((n) => n.caseId === listing.id);

  return (
    <div className="flex-1 min-w-0 space-y-5">
      {/* Workspace Toolbar: Language Switch, Blind-Score Toggle, Live Gemini Button */}
      <div className="border border-[#DFDBD2] bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div
            role="group"
            aria-label={isKo ? '인터페이스 언어 선택' : 'Interface language'}
            className="inline-flex border border-[#CFCAC0] bg-[#F7F5F0] p-0.5"
          >
            <button
              type="button"
              onClick={() => onLocaleChange('ko')}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                locale === 'ko'
                  ? 'bg-[#161616] text-white'
                  : 'text-[#5A5853] hover:text-[#161616]'
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange('en')}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                locale === 'en'
                  ? 'bg-[#161616] text-white'
                  : 'text-[#5A5853] hover:text-[#161616]'
              }`}
            >
              English
            </button>
          </div>

          <label
            className="inline-flex items-center gap-2 text-xs text-[#161616] cursor-pointer"
            title={t.blindModeHint}
          >
            <input
              type="checkbox"
              checked={hideRawScore}
              onChange={(e) => onToggleBlindScore(e.target.checked)}
              className="accent-[#E84A27]"
            />
            <EyeOff className="w-3.5 h-3.5 text-[#5A5853]" aria-hidden="true" />
            <span>{t.blindModeLabel}</span>
          </label>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRunLiveGemini}
            disabled={isAnalyzingLive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-[#161616] bg-white text-[#161616] hover:bg-[#FAF8F5] disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E84A27]" aria-hidden="true" />
            {isAnalyzingLive ? t.runningLiveGemini : t.runLiveGemini}
          </button>
        </div>
      </div>

      {liveError && (
        <div
          role="alert"
          className="border border-[#B91C1C] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]"
        >
          <span className="font-semibold">{t.liveGeminiErrorPrefix}</span> {liveError}
        </div>
      )}

      {/* Primary Triage & Evidence Comparison Card */}
      <article className="border border-[#DFDBD2] bg-white">
        {/* Card Header: Unboxed Metadata & Classification Verdict */}
        <div className="px-6 py-4 border-b border-[#DFDBD2]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A5853] mb-3">
            <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
              <span className="font-semibold text-[#161616]">{listing.id}</span>
              <span aria-hidden="true">·</span>
              <span>{listing.marketplace}</span>
              <span aria-hidden="true">·</span>
              <span>
                {countryName} ({listing.targetCountryCode})
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.capturedLabel} {listing.captureTimestamp ?? t.missingUpper}
              </span>
            </div>
            <span className="text-xs font-medium text-[#5A5853]">
              {t.sourceLabel}:{' '}
              {activeEvaluation.analysisSource === 'Live Gemini (gemini-4-hydrogen)'
                ? t.sourceLiveGemini
                : t.sourceBaseline}
            </span>
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

            {showThresholdRubric && (
              <p className="mt-2 pt-2 border-t border-black/10 text-xs text-[#161616] leading-relaxed">
                {activeEvaluation.thresholdExplanation}
              </p>
            )}
          </div>

          {/* Legitimate Resale / First-Sale Context Indicator */}
          {activeEvaluation.isLegitimateResaleContext && (
            <div
              data-testid="resale-context-indicator"
              className="mt-3 border border-[#15803D] bg-[#F0FDF4] px-4 py-2.5 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-[#166534] leading-relaxed">
                <span className="font-semibold">{t.resaleBadgeTitle}</span>{' '}
                {t.resaleBadgeBody} ({activeEvaluation.resaleSignals.join(', ')})
              </div>
            </div>
          )}

          {/* Mandatory Data-Curation Audit Lock */}
          {!activeEvaluation.mandatoryAudit.valid && (
            <div
              data-testid="missing-evidence-warning"
              className="mt-3 border border-[#B91C1C] bg-[#FFF5F5] p-4"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 text-xs text-[#991B1B]">
                  <p className="font-semibold">{t.lockBannerTitle}</p>
                  <ul className="mt-1 list-disc list-inside space-y-0.5">
                    {activeEvaluation.mandatoryAudit.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#FECACA] grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div>
                  <label htmlFor="fix-seller-id" className="block text-[11px] font-medium text-[#161616] mb-1">
                    {t.fixSellerLabel}
                  </label>
                  <input
                    id="fix-seller-id"
                    type="text"
                    value={sellerInput}
                    onChange={(e) => setSellerInput(e.target.value)}
                    className="w-full border border-[#CFCAC0] bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="fix-timestamp" className="block text-[11px] font-medium text-[#161616] mb-1">
                    {t.fixTimestampLabel}
                  </label>
                  <input
                    id="fix-timestamp"
                    type="text"
                    value={timestampInput}
                    onChange={(e) => setTimestampInput(e.target.value)}
                    className="w-full border border-[#CFCAC0] bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="fix-trademark" className="block text-[11px] font-medium text-[#161616] mb-1">
                    {listing.targetCountryCode} {t.fixTrademarkLabel}
                  </label>
                  <select
                    id="fix-trademark"
                    value={tmInput}
                    onChange={(e) => setTmInput(e.target.value as TrademarkStatus)}
                    className="w-full border border-[#CFCAC0] bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onCompleteMissingFields({
                      sellerId: sellerInput.trim(),
                      captureTimestamp: timestampInput.trim(),
                      trademarkStatus: tmInput,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#161616] text-white hover:bg-[#333333] whitespace-nowrap shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.fixSubmitBtn}
                </button>
              </div>
            </div>
          )}

          {/* Explainable AI Rationale */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-[#5A5853] mb-2">
              {t.rationaleHeading}
            </h3>
            <ul className="space-y-1.5 text-sm text-[#161616]">
              {activeEvaluation.rationaleBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#E84A27] font-mono text-xs mt-1" aria-hidden="true">
                    0{idx + 1}
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Part 5: Baseline vs. Live Gemini Side-by-Side Diff (when Live Gemini has been run) */}
        {liveEvaluation && (
          <div
            data-testid="gemini-comparison-panel"
            className="px-6 py-4 border-b border-[#DFDBD2] bg-[#FAF6F2]"
          >
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-[#161616]">
                {t.sectionExperimentHeading}
              </h3>
              <p className="text-xs text-[#5A5853] mt-0.5">{t.experimentCompareSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="border border-[#DFDBD2] bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#161616]">{t.experimentColBaseline}</span>
                  <span className="font-mono text-[#5A5853]">
                    {getShortRiskLabel(baselineEvaluation.classification, locale)}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-[#44423D] list-disc list-inside">
                  {baselineEvaluation.rationaleBullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="border border-[#E84A27] bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#161616]">{t.experimentColGemini}</span>
                  <span className="font-mono font-semibold text-[#E84A27]">
                    {getShortRiskLabel(liveEvaluation.classification, locale)}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-[#44423D] list-disc list-inside">
                  {liveEvaluation.rationaleBullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-3">
                <label htmlFor="exp-issue-type" className="block text-[11px] font-medium text-[#161616] mb-1">
                  {t.experimentIssueLabel}
                </label>
                <select
                  id="exp-issue-type"
                  value={expIssueType}
                  onChange={(e) => setExpIssueType(e.target.value as AiExperimentNote['issueType'])}
                  className="w-full border border-[#CFCAC0] bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="NONE">{isKo ? '정상/일치' : 'Consistent'}</option>
                  <option value="INCORRECT">{isKo ? '오판 (Incorrect)' : 'Incorrect'}</option>
                  <option value="UNCLEAR">{isKo ? '모호함 (Unclear)' : 'Unclear'}</option>
                  <option value="UNSUPPORTED">{isKo ? '근거 부족 (Unsupported)' : 'Unsupported'}</option>
                  <option value="INCONSISTENT">{isKo ? '일관성 부족 (Inconsistent)' : 'Inconsistent'}</option>
                </select>
              </div>
              <div className="sm:col-span-7">
                <input
                  type="text"
                  aria-label={t.experimentIssueLabel}
                  value={expNoteText}
                  onChange={(e) => setExpNoteText(e.target.value)}
                  placeholder={t.experimentNotePlaceholder}
                  className="w-full border border-[#CFCAC0] bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!expNoteText.trim()) return;
                    onSaveExperimentNote(expIssueType, expNoteText.trim());
                    setExpNoteText('');
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-[#161616] text-white hover:bg-[#333333] whitespace-nowrap"
                >
                  {t.experimentSaveBtn}
                </button>
              </div>
            </div>

            {caseExperimentNotes.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-[#44423D]">
                {caseExperimentNotes.map((item, idx) => (
                  <li key={idx} className="font-mono">
                    [{item.issueType}] {item.note} ({item.timestamp})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Visual Comparison Section */}
        <div className="peer-feedback-region px-6 py-4 border-b border-[#DFDBD2]">
          <FeedbackHighlight topic="visual" locale={locale} />
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h3 className="text-xs font-semibold text-[#5A5853]">
              {t.sectionVisualHeading}
            </h3>
            <span className="text-xs text-[#5A5853]">{silhouetteNote}</span>
          </div>
          <ProductVisualComparison
            sku={skuRef.sku}
            productName={productName}
            visualMode={listing.visualMode}
            similarityScore={listing.visualSimilarityScore}
            observation={visualObs}
            locale={locale}
            hideRawScore={hideRawScore}
          />
          <p className="mt-2 text-[11px] text-[#5A5853]">
            {activeEvaluation.evidenceChecks[0]?.curationLimitation}
          </p>
        </div>

        {/* Side-by-Side Structured Evidence Table with Data-Curation Origins & Limitations */}
        <div className="peer-feedback-region px-6 py-4 border-b border-[#DFDBD2]">
          <FeedbackHighlight topic="evidence" locale={locale} />
          <h3 className="text-xs font-semibold text-[#5A5853] mb-2.5">
            {t.sectionEvidenceHeading}
          </h3>

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
        </div>

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
            {!activeEvaluation.isApprovalLocked && (
              <button
                type="button"
                onClick={() => onOpenPackageModal(draftText)}
                className="text-xs font-medium text-[#E84A27] hover:underline whitespace-nowrap shrink-0"
              >
                {t.previewPackageBtn}
              </button>
            )}
          </div>

          <textarea
            id="draft-takedown-textarea"
            rows={3}
            value={draftText}
            disabled={activeEvaluation.isApprovalLocked}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full border border-[#CFCAC0] bg-white px-3 py-2.5 text-sm text-[#161616] leading-relaxed disabled:bg-[#F3F1EC] disabled:text-[#5A5853]"
          />

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
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder={t.overrideNotePlaceholder}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-xs text-[#161616]"
              />
            </div>

            <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  onHumanDecision('DISMISSED_LEGITIMATE', decisionDriver, overrideNote, draftText)
                }
                className={`px-3.5 py-2 text-xs font-medium border whitespace-nowrap shrink-0 transition-colors ${
                  currentHumanAction === 'DISMISSED_LEGITIMATE'
                    ? 'border-[#15803D] bg-[#F0FDF4] text-[#166534]'
                    : 'border-[#CFCAC0] bg-white text-[#161616] hover:bg-[#FAF8F5]'
                }`}
              >
                {t.btnDismiss}
              </button>

              <button
                type="button"
                onClick={() =>
                  onHumanDecision('HOLD_VERIFICATION', decisionDriver, overrideNote, draftText)
                }
                className={`px-3.5 py-2 text-xs font-medium border whitespace-nowrap shrink-0 transition-colors ${
                  currentHumanAction === 'HOLD_VERIFICATION'
                    ? 'border-[#B45309] bg-[#FFFBEB] text-[#92400E]'
                    : 'border-[#CFCAC0] bg-white text-[#161616] hover:bg-[#FAF8F5]'
                }`}
              >
                {t.btnHold}
              </button>

              <button
                type="button"
                disabled={activeEvaluation.isApprovalLocked}
                title={activeEvaluation.lockReason ?? t.btnApprove}
                onClick={() =>
                  onHumanDecision('APPROVED_TAKEDOWN', decisionDriver, overrideNote, draftText)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#E84A27] text-white hover:bg-[#D13D1C] disabled:bg-[#D4CFC7] disabled:text-[#5A5853] disabled:cursor-not-allowed whitespace-nowrap shrink-0 transition-colors"
              >
                {activeEvaluation.isApprovalLocked && (
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {t.btnApprove}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#5A5853]">
            {t.transparencyPrefix} {activeEvaluation.caveats.join(' ')}
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
            <table className="w-full text-left border-collapse text-xs">
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
                      {getShortRiskLabel(log.aiClassification, locale)}
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
                    <td className="py-2.5 px-4 text-[#5A5853]">{log.note || '—'}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#5A5853]">
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
