import { useMemo, useState } from 'react';
import { CaseQueueSidebar, type QueueCaseItem } from './components/CaseQueueSidebar';
import { CustomSyntheticModal } from './components/CustomSyntheticModal';
import { ReportPackageModal } from './components/ReportPackageModal';
import { SampleDatasetView } from './components/SampleDatasetView';
import { TriageDetailWorkspace } from './components/TriageDetailWorkspace';
import { WorkflowContextView } from './components/WorkflowContextView';
import { GENUINE_SKU_CATALOG, SYNTHETIC_LISTING_CASES } from './domain/syntheticCases';
import { evaluateDeterministicTriage } from './domain/triageRules';
import type {
  AiExperimentNote,
  AuditLogEntry,
  DecisionDriver,
  HumanActionType,
  Locale,
  SuspectListingRecord,
  TrademarkStatus,
  TriageEvaluation,
} from './domain/types';
import { UI_COPY } from './i18n/translations';

type ActiveTab = 'triage' | 'workflow' | 'dataset';

export default function App() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [activeTab, setActiveTab] = useState<ActiveTab>('triage');
  const [cases, setCases] = useState<SuspectListingRecord[]>(SYNTHETIC_LISTING_CASES);
  const [selectedId, setSelectedId] = useState<string>(SYNTHETIC_LISTING_CASES[0].id);
  const [hideRawScore, setHideRawScore] = useState(false);

  const [humanActions, setHumanActions] = useState<Record<string, HumanActionType>>({});
  const [liveEvaluations, setLiveEvaluations] = useState<Record<string, TriageEvaluation>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [experimentNotes, setExperimentNotes] = useState<AiExperimentNote[]>([]);

  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [packageModalState, setPackageModalState] = useState<{
    open: boolean;
    draftText: string;
  }>({ open: false, draftText: '' });

  const t = UI_COPY[locale];

  const selectedListing = useMemo(
    () => cases.find((c) => c.id === selectedId) ?? cases[0],
    [cases, selectedId]
  );

  const selectedSkuRef = GENUINE_SKU_CATALOG[selectedListing.matchedSku];

  const getBaselineForCase = (listing: SuspectListingRecord): TriageEvaluation => {
    const skuRef = GENUINE_SKU_CATALOG[listing.matchedSku];
    return evaluateDeterministicTriage(listing, skuRef, locale);
  };

  const getLiveSyncedForCase = (
    listing: SuspectListingRecord,
    baseline: TriageEvaluation
  ): TriageEvaluation | null => {
    const live = liveEvaluations[listing.id];
    if (!live) return null;
    return {
      ...live,
      isLegitimateResaleContext: baseline.isLegitimateResaleContext,
      isApprovalLocked: baseline.isApprovalLocked,
      lockReason: baseline.lockReason,
      mandatoryAudit: baseline.mandatoryAudit,
      classification: !baseline.mandatoryAudit.valid
        ? 'HOLD_MISSING_DATA'
        : live.classification,
      draftTakedownSummary: !baseline.mandatoryAudit.valid
        ? baseline.draftTakedownSummary
        : live.draftTakedownSummary,
    };
  };

  const baselineEvaluation = getBaselineForCase(selectedListing);
  const liveEvaluation = getLiveSyncedForCase(selectedListing, baselineEvaluation);
  const activeEvaluation = liveEvaluation ?? baselineEvaluation;

  const queueItems: QueueCaseItem[] = useMemo(
    () =>
      cases.map((listing) => {
        const base = evaluateDeterministicTriage(
          listing,
          GENUINE_SKU_CATALOG[listing.matchedSku],
          locale
        );
        const live = getLiveSyncedForCase(listing, base);
        return {
          listing,
          classification: (live ?? base).classification,
          humanAction: humanActions[listing.id] ?? 'PENDING',
        };
      }),
    [cases, locale, humanActions, liveEvaluations]
  );

  const runLiveGeminiForListing = async (listing: SuspectListingRecord) => {
    setIsAnalyzingLive(true);
    setLiveError(null);
    try {
      const skuRef = GENUINE_SKU_CATALOG[listing.matchedSku];
      const response = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing, skuRef, locale }),
      });

      const payload = (await response.json()) as {
        evaluation?: TriageEvaluation;
        error?: string;
      };

      if (!response.ok || !payload.evaluation) {
        throw new Error(payload.error || `Request failed with status ${response.status}`);
      }

      setLiveEvaluations((prev) => ({
        ...prev,
        [listing.id]: payload.evaluation!,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run live Gemini triage.';
      setLiveError(message);
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  const handleSelectCase = (id: string) => {
    setSelectedId(id);
    setLiveError(null);
  };

  const handleCompleteMissingFields = (updates: {
    sellerId: string;
    captureTimestamp: string;
    trademarkStatus: TrademarkStatus;
  }) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === selectedListing.id
          ? {
              ...item,
              sellerId: updates.sellerId || null,
              sellerStatus: updates.sellerId ? 'Unlisted' : 'Missing',
              captureTimestamp: updates.captureTimestamp || null,
              trademarkStatus: updates.trademarkStatus,
            }
          : item
      )
    );
    setLiveEvaluations((prev) => {
      const next = { ...prev };
      delete next[selectedListing.id];
      return next;
    });
  };

  const handleHumanDecision = (
    action: Exclude<HumanActionType, 'PENDING'>,
    driver: DecisionDriver,
    overrideNote: string,
    draftText: string
  ) => {
    setHumanActions((prev) => ({
      ...prev,
      [selectedListing.id]: action,
    }));

    const overrodeAi = action !== activeEvaluation.recommendedAction;
    const nowTime = new Date().toISOString().slice(11, 19) + ' UTC';

    const entry: AuditLogEntry = {
      id: `${selectedListing.id}-${Date.now()}`,
      caseId: selectedListing.id,
      productName:
        locale === 'ko' ? selectedSkuRef.productNameKo : selectedSkuRef.productName,
      aiClassification: activeEvaluation.classification,
      humanAction: action,
      decisionDriver: driver,
      overrodeAi,
      note: overrideNote.trim(),
      timestamp: nowTime,
    };

    setAuditLogs((prev) => [entry, ...prev]);

    if (action === 'APPROVED_TAKEDOWN') {
      setPackageModalState({ open: true, draftText });
    }
  };

  const handleSaveExperimentNote = (
    issueType: AiExperimentNote['issueType'],
    note: string
  ) => {
    const entry: AiExperimentNote = {
      caseId: selectedListing.id,
      issueType,
      note,
      timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
    };
    setExperimentNotes((prev) => [entry, ...prev]);
  };

  const handleCreateCustomCase = (
    newRecord: SuspectListingRecord,
    shouldRunLiveGemini: boolean
  ) => {
    setCases((prev) => [newRecord, ...prev]);
    setSelectedId(newRecord.id);
    setActiveTab('triage');
    setLiveError(null);
    if (shouldRunLiveGemini) {
      void runLiveGeminiForListing(newRecord);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#161616]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-[#DFDBD2]">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('triage');
            }}
            className="text-base font-bold tracking-tight text-[#161616] whitespace-nowrap shrink-0"
          >
            {t.brandTitle}
          </a>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('triage')}
              className={`py-1 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'triage'
                  ? 'border-[#E84A27] text-[#161616]'
                  : 'border-transparent text-[#5A5853] hover:text-[#161616]'
              }`}
            >
              {t.navTriage}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={`py-1 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'workflow'
                  ? 'border-[#E84A27] text-[#161616]'
                  : 'border-transparent text-[#5A5853] hover:text-[#161616]'
              }`}
            >
              {t.navWorkflow}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dataset')}
              className={`py-1 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                activeTab === 'dataset'
                  ? 'border-[#E84A27] text-[#161616]'
                  : 'border-transparent text-[#5A5853] hover:text-[#161616]'
              }`}
            >
              {t.navSampleData}
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="px-4 py-2 text-xs font-medium bg-[#E84A27] text-white hover:bg-[#D13D1C] whitespace-nowrap shrink-0 transition-colors"
            >
              {t.ctaNewTest}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Strip */}
      <nav
        aria-label="Mobile view switcher"
        className="md:hidden bg-white border-b border-[#DFDBD2] px-4 py-2 flex items-center gap-4 overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => setActiveTab('triage')}
          className={`text-xs font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'triage' ? 'text-[#E84A27] underline underline-offset-4' : 'text-[#5A5853]'
          }`}
        >
          {t.navTriage}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`text-xs font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'workflow' ? 'text-[#E84A27] underline underline-offset-4' : 'text-[#5A5853]'
          }`}
        >
          {t.navWorkflow}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dataset')}
          className={`text-xs font-medium whitespace-nowrap shrink-0 ${
            activeTab === 'dataset' ? 'text-[#E84A27] underline underline-offset-4' : 'text-[#5A5853]'
          }`}
        >
          {t.navSampleData}
        </button>
      </nav>

      {/* Main Content */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pb-4 border-b border-[#DFDBD2]">
          <div>
            <p className="text-xs font-medium text-[#E84A27]">{t.heroKicker}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#161616] mt-0.5 text-balance break-keep">
              {t.heroTitle}
            </h1>
          </div>
          <p className="text-xs text-[#5A5853]">{t.heroMeta}</p>
        </div>

        {activeTab === 'triage' && (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <CaseQueueSidebar
              items={queueItems}
              selectedId={selectedListing.id}
              locale={locale}
              onSelect={handleSelectCase}
            />
            <TriageDetailWorkspace
              listing={selectedListing}
              skuRef={selectedSkuRef}
              baselineEvaluation={baselineEvaluation}
              liveEvaluation={liveEvaluation}
              experimentNotes={experimentNotes}
              locale={locale}
              hideRawScore={hideRawScore}
              currentHumanAction={humanActions[selectedListing.id] ?? 'PENDING'}
              auditLogs={auditLogs}
              isAnalyzingLive={isAnalyzingLive}
              liveError={liveError}
              onLocaleChange={setLocale}
              onToggleBlindScore={setHideRawScore}
              onRunLiveGemini={() => void runLiveGeminiForListing(selectedListing)}
              onSaveExperimentNote={handleSaveExperimentNote}
              onCompleteMissingFields={handleCompleteMissingFields}
              onHumanDecision={handleHumanDecision}
              onOpenPackageModal={(draftText) =>
                setPackageModalState({ open: true, draftText })
              }
            />
          </div>
        )}

        {activeTab === 'workflow' && (
          <WorkflowContextView
            locale={locale}
            auditLogs={auditLogs}
            onBackToTriage={() => setActiveTab('triage')}
          />
        )}

        {activeTab === 'dataset' && (
          <SampleDatasetView
            cases={cases}
            auditLogs={auditLogs}
            locale={locale}
            onSelectCaseInWorkspace={(id) => {
              setSelectedId(id);
              setActiveTab('triage');
            }}
            onBackToTriage={() => setActiveTab('triage')}
          />
        )}
      </main>

      <footer className="border-t border-[#DFDBD2] bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5A5853]">
          <span>{t.footerLeft}</span>
          <span>{t.footerRight}</span>
        </div>
      </footer>

      <CustomSyntheticModal
        isOpen={isCustomModalOpen}
        locale={locale}
        onClose={() => setIsCustomModalOpen(false)}
        onCreate={handleCreateCustomCase}
      />

      <ReportPackageModal
        isOpen={packageModalState.open}
        locale={locale}
        onClose={() => setPackageModalState({ open: false, draftText: '' })}
        listing={selectedListing}
        skuRef={selectedSkuRef}
        evaluation={activeEvaluation}
        draftText={packageModalState.draftText}
      />
    </div>
  );
}
