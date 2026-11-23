import { useMemo, useState } from 'react';
import { CaseQueueSidebar, type QueueCaseItem } from './components/CaseQueueSidebar';
import { ReportPackageModal } from './components/ReportPackageModal';
import { SampleDatasetView } from './components/SampleDatasetView';
import { TriageDetailWorkspace } from './components/TriageDetailWorkspace';
import { WorkflowContextView } from './components/WorkflowContextView';
import { GENUINE_SKU_CATALOG, SYNTHETIC_LISTING_CASES } from './domain/syntheticCases';
import { buildReviewEvidence, createReportSnapshot, recordHumanDecision } from './domain/evidenceReview';
import { preparedTriage } from './domain/preparedTriage';
import type {
  EvidenceReview,
  ReportSnapshot,
  AuditLogEntry,
  DecisionDriver,
  HumanActionType,
  Locale,
} from './domain/types';
import { UI_COPY } from './i18n/translations';

type ActiveTab = 'triage' | 'workflow' | 'dataset';

export default function App() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [activeTab, setActiveTab] = useState<ActiveTab>('triage');
  const [selectedId, setSelectedId] = useState<string>(SYNTHETIC_LISTING_CASES[0].id);

  const [humanActions, setHumanActions] = useState<Record<string, HumanActionType>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [packageSnapshot, setPackageSnapshot] = useState<ReportSnapshot | null>(null);

  const t = UI_COPY[locale];

  const selectedListing = SYNTHETIC_LISTING_CASES.find(listing => listing.id === selectedId) ?? SYNTHETIC_LISTING_CASES[0];
  const selectedSkuRef = GENUINE_SKU_CATALOG[selectedListing.matchedSku];
  const example = preparedTriage(selectedListing.id, locale);
  const baselineEvaluation = example.evaluation;

  const queueItems: QueueCaseItem[] = useMemo(
    () => SYNTHETIC_LISTING_CASES.map(listing => ({
      listing,
      classification: preparedTriage(listing.id, locale).evaluation.classification,
      humanAction: humanActions[listing.id] ?? 'PENDING',
    })),
    [locale, humanActions]
  );

  const handleHumanDecision = (
    action: Exclude<HumanActionType, 'PENDING'>, driver: DecisionDriver, rationale: string,
    draft: string, review: EvidenceReview, confirmed: boolean,
  ) => {
    const items = buildReviewEvidence(selectedListing, selectedSkuRef, baselineEvaluation, locale);
    const entry = recordHumanDecision({ action, driver, rationale, draft, review, confirmed,
      evaluation: baselineEvaluation, items, caseId: selectedListing.id, locale,
      productName: locale === 'ko' ? selectedSkuRef.productNameKo : selectedSkuRef.productName,
      timestamp: new Date().toISOString(),
    });
    if (!entry) return;
    setHumanActions(prev => ({ ...prev, [selectedListing.id]: action }));
    setAuditLogs(prev => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#161616]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-[#DFDBD2]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a
            href="#top"
            data-feedback-workspace
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('triage');
            }}
            className="min-w-0 text-sm leading-tight font-bold tracking-tight text-[#161616] sm:text-base"
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

          <div role="group" aria-label={locale === 'ko' ? '인터페이스 언어 선택' : 'Interface language'}
            className="inline-flex shrink-0 rounded-md border border-[#DFDBD2] bg-[#F7F5F0] p-0.5">
            {(['ko', 'en'] as const).map(language => (
              <button key={language} type="button" aria-pressed={locale === language}
                onClick={() => setLocale(language)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium ${locale === language ? 'bg-[#161616] text-white' : 'text-[#5A5853]'}`}>
                {language === 'ko' ? '한국어' : 'English'}
              </button>
            ))}
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.heroTitle}</h1>
          <p className="rounded-full border border-[#DFDBD2] bg-white px-3 py-1 text-xs text-[#5A5853]">{t.heroMeta}</p>
        </div>

        {activeTab === 'triage' && (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <CaseQueueSidebar
              items={queueItems}
              selectedId={selectedListing.id}
              locale={locale}
              onSelect={setSelectedId}
            />
            <TriageDetailWorkspace
              key={selectedListing.id}
              listing={selectedListing}
              skuRef={selectedSkuRef}
              baselineEvaluation={baselineEvaluation}
              exampleSummary={example.summary}
              locale={locale}
              currentHumanAction={humanActions[selectedListing.id] ?? 'PENDING'}
              auditLogs={auditLogs}
              onHumanDecision={handleHumanDecision}
              onOpenPackageModal={review => setPackageSnapshot(createReportSnapshot(selectedListing.id, buildReviewEvidence(selectedListing, selectedSkuRef, baselineEvaluation, locale), review, locale))}
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
            cases={SYNTHETIC_LISTING_CASES}
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
        </div>
      </footer>

      <ReportPackageModal
        snapshot={packageSnapshot}
        onClose={() => setPackageSnapshot(null)}
      />
    </div>
  );
}
