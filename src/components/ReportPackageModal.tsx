import { useEffect, useRef, useState } from 'react';
import { Check, Copy, FileText, X } from 'lucide-react';
import type { ReportSnapshot } from '../domain/types';
import { EVIDENCE_COPY } from '../i18n/translations';

export function ReportPackageModal({ snapshot, onClose }: {
  snapshot: ReportSnapshot | null; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setCopied(false);
    if (!snapshot) return;
    const previous = document.activeElement;
    closeRef.current?.focus();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, [snapshot]);
  if (!snapshot) return null;
  const t = EVIDENCE_COPY[snapshot.locale];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="report-package-title"
    onKeyDown={e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('button');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
    <div className="w-full max-w-2xl bg-white border border-[#161616] max-h-[90vh] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#DFDBD2] flex items-center justify-between gap-3">
        <h2 id="report-package-title" className="text-base font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-[#E84A27]" />{t.previewTitle}</h2>
        <button type="button" ref={closeRef} onClick={onClose} aria-label={t.close} className="p-2"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-xs text-[#5A5853]">{t.previewNotice}</p>
        <p className="text-xs">{snapshot.caseId} · {snapshot.version} · {snapshot.selectedEvidenceIds.join(', ')}</p>
        <pre data-testid="package-text" className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{snapshot.text}</pre>
        <button type="button" className="inline-flex items-center gap-2 border border-[#161616] px-4 py-2 text-xs" onClick={async () => {
          try { await navigator.clipboard.writeText(snapshot.text); setCopied(true); } catch { setCopied(false); }
        }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.copied : t.copy}</button>
      </div>
    </div>
  </div>;
}
