import type { Locale, VisualDefectMode } from '../domain/types';
import { UI_COPY } from '../i18n/translations';

interface ProductVisualComparisonProps {
  sku: string;
  productName: string;
  visualMode: VisualDefectMode;
  similarityScore: number;
  observation: string;
  locale: Locale;
  hideRawScore: boolean;
}

function GenuineBagIllustration({ sku }: { sku: string }) {
  if (sku === 'SKU-AJ-ACC-12') {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-24 text-[#161616]" aria-hidden="true">
        <rect x="48" y="28" width="124" height="82" rx="4" fill="#FAF8F5" stroke="currentColor" strokeWidth="1.75" />
        <line x1="48" y1="50" x2="172" y2="50" stroke="currentColor" strokeWidth="1.2" />
        <line x1="48" y1="68" x2="172" y2="68" stroke="currentColor" strokeWidth="1.2" />
        <line x1="48" y1="86" x2="172" y2="86" stroke="currentColor" strokeWidth="1.2" />
        <text x="110" y="102" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="2" fill="currentColor">
          AJOU
        </text>
      </svg>
    );
  }

  if (sku === 'SKU-AJ-BAG-04') {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-24 text-[#161616]" aria-hidden="true">
        <path d="M74 52 C74 20, 146 20, 146 52" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <rect x="58" y="52" width="104" height="66" rx="14" fill="#FAF8F5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M58 76 Q110 92 162 76" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <rect x="103" y="72" width="14" height="10" rx="2" fill="#E84A27" />
        <text x="110" y="103" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="2" fill="currentColor">
          AJOU
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 140" className="w-full h-24 text-[#161616]" aria-hidden="true">
      <path d="M58 58 C60 16, 160 16, 162 58" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M50 58 Q110 72 170 58 C166 106, 142 120, 110 120 C78 120, 54 106, 50 58 Z"
        fill="#FAF8F5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M56 64 Q110 76 164 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="3 2"
      />
      <rect x="94" y="84" width="32" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="110" y="94" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="2" fill="currentColor">
        AJOU
      </text>
    </svg>
  );
}

function SuspectBagIllustration({
  sku,
  visualMode,
}: {
  sku: string;
  visualMode: VisualDefectMode;
}) {
  const isBlurry = visualMode === 'blurry_lowres';
  const isDistorted = visualMode === 'distorted_logo';
  const isUsedAngle = visualMode === 'authentic_used';

  if (sku === 'SKU-AJ-ACC-12') {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-24 text-[#161616]" aria-hidden="true">
        <g transform="rotate(3 110 70)">
          <rect x="48" y="28" width="124" height="82" rx="4" fill="#F3F1EC" stroke="currentColor" strokeWidth="1.75" />
          <line x1="48" y1="50" x2="172" y2="50" stroke="currentColor" strokeWidth="1.2" />
          <line x1="48" y1="68" x2="172" y2="68" stroke="currentColor" strokeWidth="1.2" />
          <line x1="48" y1="86" x2="172" y2="86" stroke="currentColor" strokeWidth="1.2" />
          <text x="110" y="102" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="2" fill="currentColor">
            AJOU
          </text>
          {visualMode === 'unclear_serial' && (
            <g>
              <rect x="124" y="53" width="40" height="13" fill="#FEF3C7" stroke="#B45309" strokeWidth="1" strokeDasharray="2 2" />
              <text x="144" y="62" textAnchor="middle" fontSize="6.5" fill="#92400E" fontWeight="600">
                SERIAL ?
              </text>
            </g>
          )}
        </g>
      </svg>
    );
  }

  if (sku === 'SKU-AJ-BAG-04') {
    return (
      <svg viewBox="0 0 220 140" className="w-full h-24 text-[#161616]" aria-hidden="true">
        <path d="M74 52 C74 20, 146 20, 146 52" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <rect x="58" y="52" width="104" height="66" rx="14" fill="#FAF8F5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M58 76 Q110 92 162 76" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <rect x="103" y="72" width="14" height="10" rx="2" fill="#15803D" />
        <text x="110" y="103" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="2" fill="currentColor">
          AJOU
        </text>
      </svg>
    );
  }

  const groupTransform = isUsedAngle
    ? 'rotate(-8 110 70) scale(0.95)'
    : isBlurry
      ? 'translate(14 8) scale(1.12)'
      : undefined;

  return (
    <svg
      viewBox="0 0 220 140"
      className={`w-full h-24 text-[#161616] ${isBlurry ? 'opacity-60 blur-[1.4px]' : ''}`}
      aria-hidden="true"
    >
      <g transform={groupTransform}>
        <path
          d={isDistorted ? 'M62 60 C68 24, 152 28, 160 62' : 'M58 58 C60 16, 160 16, 162 58'}
          fill="none"
          stroke={isDistorted ? '#B91C1C' : 'currentColor'}
          strokeWidth="2"
        />
        <path
          d={
            isDistorted
              ? 'M52 60 Q114 78 168 62 C160 105, 138 116, 108 117 C76 117, 57 104, 52 60 Z'
              : 'M50 58 Q110 72 170 58 C166 106, 142 120, 110 120 C78 120, 54 106, 50 58 Z'
          }
          fill="#F3F1EC"
          stroke="currentColor"
          strokeWidth="2"
        />
        {isUsedAngle && (
          <g>
            <path d="M64 104 L76 112" stroke="#B45309" strokeWidth="1.75" strokeLinecap="round" />
            <circle cx="70" cy="108" r="9" fill="none" stroke="#B45309" strokeWidth="0.9" strokeDasharray="2 2" />
          </g>
        )}
        {isDistorted ? (
          <g>
            <rect x="88" y="83" width="44" height="16" fill="#FEE2E2" stroke="#B91C1C" strokeWidth="1" strokeDasharray="3 2" />
            <text
              x="110"
              y="95"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              letterSpacing="0.5"
              fill="#B91C1C"
              transform="rotate(-4 110 92)"
            >
              AJ0U
            </text>
          </g>
        ) : (
          <g>
            <rect x="94" y="84" width="32" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
            <text x="110" y="94" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="2" fill="currentColor">
              AJOU
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

export function ProductVisualComparison({
  sku,
  productName,
  visualMode,
  similarityScore,
  observation,
  locale,
  hideRawScore,
}: ProductVisualComparisonProps) {
  const t = UI_COPY[locale];
  const scoreTone =
    similarityScore >= 0.85
      ? 'text-[#15803D]'
      : similarityScore >= 0.65
        ? 'text-[#B45309]'
        : 'text-[#B91C1C]';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="border border-[#DFDBD2] bg-[#FAF8F5] p-3">
        <div className="flex items-center justify-between text-xs text-[#5A5853] mb-2">
          <span className="font-medium text-[#161616]">{t.collectedCaptureTitle}</span>
          {hideRawScore ? (
            <span className="font-mono text-[11px] text-[#5A5853]">
              {t.scoreHiddenLabel}
            </span>
          ) : (
            <span className={`font-mono tabular-nums font-medium ${scoreTone}`}>
              {similarityScore.toFixed(2)} {t.scoreMatchSuffix}
            </span>
          )}
        </div>
        <div className="bg-white border border-[#EAE6DD] flex items-center justify-center p-2 overflow-hidden">
          <SuspectBagIllustration sku={sku} visualMode={visualMode} />
        </div>
        <p className="mt-2 text-xs text-[#44423D] leading-relaxed">
          {observation}
        </p>
      </div>

      <div className="border border-[#DFDBD2] bg-[#FAF8F5] p-3">
        <div className="flex items-center justify-between text-xs text-[#5A5853] mb-2">
          <span className="font-medium text-[#161616]">{t.genuineRefTitle}</span>
          <span className="font-mono tabular-nums">{sku}</span>
        </div>
        <div className="bg-white border border-[#EAE6DD] flex items-center justify-center p-2">
          <GenuineBagIllustration sku={sku} />
        </div>
        <p className="mt-2 text-xs text-[#44423D] leading-relaxed">
          {locale === 'ko'
            ? `${productName} 공식 스튜디오 실루엣, 스티칭 간격 및 각인 규격`
            : `Official ${productName} studio geometry, stitch spacing & stamped mark`}
        </p>
      </div>
    </div>
  );
}
