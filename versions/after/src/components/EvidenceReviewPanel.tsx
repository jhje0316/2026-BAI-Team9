import type { EvidenceReview, Locale, ReviewEvidence } from '../domain/types';
import { EVIDENCE_COPY } from '../i18n/translations';
import { FeedbackHighlight } from '../../../../presentation/FeedbackHighlight';

export function EvidenceReviewPanel({ items, review, locale, onChange }: {
  items: ReviewEvidence[]; review: EvidenceReview; locale: Locale; onChange: (review: EvidenceReview) => void;
}) {
  const t = EVIDENCE_COPY[locale];
  const reviewedCount = items.filter(item => review[item.id]?.status === 'reviewed').length;
  return <section className="peer-feedback-region px-6 py-4 border-b border-[#DFDBD2]" aria-labelledby="evidence-review-title">
    <FeedbackHighlight topic="evidence" locale={locale} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 id="evidence-review-title" className="text-sm font-semibold">{t.heading}</h3>
      <span className="rounded-full bg-[#F3F1EC] px-2.5 py-1 text-xs tabular-nums">
        {reviewedCount}/{items.length} {t.reviewed}
      </span>
    </div>
    <p className="mt-1 mb-2 text-xs text-[#5A5853]">{t.intro}</p>
    <ul className="divide-y divide-[#DFDBD2]">
      {items.map(item => <li key={item.id} className="py-2.5 grid grid-cols-1 items-start gap-x-5 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto]" data-testid={`evidence-${item.id}`}>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold">{item.name}</h4>
            <p className="mt-0.5 line-clamp-2 break-words text-xs text-[#44423D]">{item.value}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs pt-0.5">
            <label className="flex items-center gap-1.5"><input type="checkbox" data-testid={`review-${item.id}`} checked={review[item.id]?.status === 'reviewed'}
              onChange={e => onChange({ ...review, [item.id]: e.target.checked ? { status: 'reviewed', included: false } : { status: 'unreviewed', included: false } })} />{t.reviewed}</label>
            <label className="flex items-center gap-1.5 has-disabled:text-[#686661]"><input type="checkbox" data-testid={`include-${item.id}`} checked={Boolean(review[item.id]?.included)}
              disabled={review[item.id]?.status !== 'reviewed' || !item.reportable || !item.available}
              onChange={e => onChange({ ...review, [item.id]: { status: 'reviewed', included: e.target.checked } })} />{t.include}</label>
          </div>
        <details className="text-xs text-[#5A5853] sm:col-span-2">
          <summary className="cursor-pointer w-fit underline decoration-[#CFCAC0] underline-offset-2">{t.evidenceDetails}</summary>
          <div className="mt-2 space-y-1.5 rounded bg-[#F7F5F0] p-2.5 leading-relaxed">
            <p className="font-medium">{t[item.kind]} · {t.unverified}</p>
            <p className="whitespace-pre-wrap break-words">{item.value}</p>
            <p className="break-words">{t.source} · {item.source}</p>
            <p>{item.uncertainty}</p>
          </div>
          {(!item.available || !item.reportable) && <p className="mt-1">{t.unavailable}</p>}
        </details>
      </li>)}
    </ul>
  </section>;
}
