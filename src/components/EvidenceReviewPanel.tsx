import type { EvidenceReview, Locale, ReviewEvidence } from '../domain/types';
import { EVIDENCE_COPY } from '../i18n/translations';

export function EvidenceReviewPanel({ items, review, locale, onChange }: {
  items: ReviewEvidence[]; review: EvidenceReview; locale: Locale; onChange: (review: EvidenceReview) => void;
}) {
  const t = EVIDENCE_COPY[locale];
  return <section className="px-6 py-4 border-b border-[#DFDBD2]" aria-labelledby="evidence-review-title">
    <h3 id="evidence-review-title" className="text-sm font-semibold">{t.heading}</h3>
    <p className="text-xs text-[#5A5853] mt-1 mb-3">{t.intro}</p>
    <ul className="divide-y divide-[#DFDBD2]">
      {items.map(item => <li key={item.id} className="py-4" data-testid={`evidence-${item.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold">{item.name}</h4>
            <p className="mt-1 text-[11px] text-[#5A5853]">{t[item.kind]} · {item.simulated ? t.simulated : t.untrusted} · {t.unverified}</p>
            <p className="text-xs mt-2 whitespace-pre-wrap break-words"><span className="text-[#5A5853]">{t.value}: </span>{item.value}</p>
          </div>
          <div className="flex flex-col gap-3 text-xs shrink-0">
            <label className="flex items-center gap-2"><input type="checkbox" data-testid={`review-${item.id}`} checked={review[item.id]?.status === 'reviewed'}
              onChange={e => onChange({ ...review, [item.id]: e.target.checked ? { status: 'reviewed', included: false } : { status: 'unreviewed', included: false } })} />{t.reviewed}</label>
            <label className="flex items-center gap-2"><input type="checkbox" data-testid={`include-${item.id}`} checked={Boolean(review[item.id]?.included)}
              disabled={review[item.id]?.status !== 'reviewed' || !item.reportable || !item.available}
              onChange={e => onChange({ ...review, [item.id]: { status: 'reviewed', included: e.target.checked } })} />{t.include}</label>
          </div>
        </div>
        <details className="mt-2 text-xs text-[#5A5853]">
          <summary className="cursor-pointer w-fit">{t.source} · {t.uncertainty}</summary>
          <p className="mt-2 break-all">{item.source}</p><p className="mt-1">{item.uncertainty}</p>
          {(!item.available || !item.reportable) && <p className="mt-1">{t.unavailable}</p>}
        </details>
      </li>)}
    </ul>
  </section>;
}
