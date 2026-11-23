import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import type {
  HumanActionType,
  Locale,
  RiskClassification,
  SuspectListingRecord,
} from '../domain/types';
import { getHumanActionLabel, getShortRiskLabel, UI_COPY } from '../i18n/translations';

export interface QueueCaseItem {
  listing: SuspectListingRecord;
  classification: RiskClassification;
  humanAction: HumanActionType;
}

interface CaseQueueSidebarProps {
  items: QueueCaseItem[];
  selectedId: string;
  locale: Locale;
  onSelect: (id: string) => void;
}

function getRiskClassName(classification: RiskClassification): string {
  switch (classification) {
    case 'HIGH_RISK':
      return 'text-[#B91C1C]';
    case 'MEDIUM_RISK':
      return 'text-[#B45309]';
    case 'LOW_RISK':
      return 'text-[#15803D]';
    case 'HOLD_MISSING_DATA':
      return 'text-[#B91C1C]';
  }
}

function ClassificationIcon({ classification }: { classification: RiskClassification }) {
  switch (classification) {
    case 'HIGH_RISK':
      return <ShieldAlert className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" aria-hidden="true" />;
    case 'MEDIUM_RISK':
      return <Clock className="w-3.5 h-3.5 text-[#B45309] shrink-0" aria-hidden="true" />;
    case 'LOW_RISK':
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" aria-hidden="true" />;
    case 'HOLD_MISSING_DATA':
      return <AlertTriangle className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" aria-hidden="true" />;
  }
}

export function CaseQueueSidebar({
  items,
  selectedId,
  locale,
  onSelect,
}: CaseQueueSidebarProps) {
  const t = UI_COPY[locale];

  return (
    <aside
      aria-label={t.queueTitle}
      className="w-full lg:w-72 shrink-0 border border-[#DFDBD2] bg-white"
    >
      <div className="px-4 py-3 border-b border-[#DFDBD2] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#161616]">
          {t.queueTitle}
        </h2>
        <span className="text-xs font-mono tabular-nums text-[#5A5853]">
          {items.length} {t.casesCountSuffix}
        </span>
      </div>

      <ul className="divide-y divide-[#EAE6DD]">
        {items.map((item) => {
          const isSelected = item.listing.id === selectedId;
          const riskText = getShortRiskLabel(item.classification, locale);
          const riskColor = getRiskClassName(item.classification);
          const actionText = getHumanActionLabel(item.humanAction, locale);
          const scenarioText =
            locale === 'ko' ? item.listing.scenarioLabelKo : item.listing.scenarioLabel;
          const displayTitle =
            locale === 'ko' && item.listing.listingTitleKo
              ? item.listing.listingTitleKo
              : item.listing.listingTitle;

          return (
            <li key={item.listing.id}>
              <button
                type="button"
                onClick={() => onSelect(item.listing.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={`w-full text-left px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#E84A27] ${
                  isSelected
                    ? 'bg-[#FAF6F2]'
                    : 'bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono tabular-nums font-medium text-[#161616]">
                    {item.listing.id}
                    {item.listing.demoOrder ? (
                      <span className="text-[#E84A27] font-normal">
                        {' '}· {t.demoTagPrefix} {item.listing.demoOrder}
                      </span>
                    ) : null}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${riskColor}`}>
                    <ClassificationIcon classification={item.classification} />
                    {riskText}
                  </span>
                </div>

                <p className="text-sm font-medium text-[#161616] line-clamp-1">
                  {displayTitle}
                </p>

                <div className="mt-1.5 flex items-center justify-between text-xs text-[#5A5853]">
                  <span>
                    {item.listing.targetCountryCode} · {scenarioText}
                  </span>
                  <span
                    className={`font-medium ${
                      item.humanAction === 'PENDING' ? 'text-[#5A5853]' : 'text-[#161616]'
                    }`}
                  >
                    {actionText}
                  </span>
                </div>
                {isSelected && (
                  <div className="mt-2 h-0.5 w-full bg-[#E84A27]" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-3 border-t border-[#DFDBD2] bg-[#FAF8F5] text-xs text-[#5A5853] leading-relaxed">
        {t.queueFooter}
      </div>
    </aside>
  );
}
