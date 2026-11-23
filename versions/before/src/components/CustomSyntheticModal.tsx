import { useState } from 'react';
import { X } from 'lucide-react';
import { GENUINE_SKU_CATALOG } from '../domain/syntheticCases';
import type {
  ListingCondition,
  Locale,
  SellerStatus,
  SuspectListingRecord,
  TrademarkStatus,
} from '../domain/types';

interface CustomSyntheticModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onCreate: (listing: SuspectListingRecord, runLiveGemini: boolean) => void;
}

export function CustomSyntheticModal({
  isOpen,
  locale,
  onClose,
  onCreate,
}: CustomSyntheticModalProps) {
  const isKo = locale === 'ko';
  const [matchedSku, setMatchedSku] = useState('SKU-AJ-BAG-01');
  const [marketplace, setMarketplace] = useState('Mercari / Global Test');
  const [targetCountryCode, setTargetCountryCode] = useState('ES');
  const [targetCountryName, setTargetCountryName] = useState('Spain');
  const [listingTitle, setListingTitle] = useState(
    'Bolso media luna estilo AJOU - envío inmediato'
  );
  const [listingDescription, setListingDescription] = useState(
    'Nuevo sin caja original, diseño inspirado en AJOU ARC, calidad 1:1.'
  );
  const [condition, setCondition] = useState<ListingCondition>('New');
  const [listedPrice, setListedPrice] = useState('52');
  const [currency, setCurrency] = useState('€');
  const [officialMsrp, setOfficialMsrp] = useState('290');
  const [sellerId, setSellerId] = useState('IberiaOutlet_24');
  const [sellerStatus, setSellerStatus] = useState<SellerStatus>('Unlisted');
  const [trademarkStatus, setTrademarkStatus] = useState<TrademarkStatus>('Active');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [visualSimilarityScore, setVisualSimilarityScore] = useState('0.48');
  const [runLiveGemini, setRunLiveGemini] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(listedPrice);
    const parsedMsrp = Number(officialMsrp);
    const parsedScore = Number(visualSimilarityScore);

    if (!listingTitle.trim()) {
      setValidationError(isKo ? '리스팅 제목은 필수입니다.' : 'Listing title is required.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedMsrp) || parsedMsrp <= 0) {
      setValidationError(
        isKo
          ? '판매가와 공식 MSRP는 양수여야 합니다.'
          : 'Listed price and official MSRP must be positive numbers.'
      );
      return;
    }
    if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 1) {
      setValidationError(
        isKo
          ? '시뮬레이션 CV 유사도 점수는 0.00에서 1.00 사이여야 합니다.'
          : 'Simulated CV similarity score must be between 0.00 and 1.00.'
      );
      return;
    }

    setValidationError(null);
    const id = `AJOU-EXP-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: SuspectListingRecord = {
      id,
      scenarioLabel: 'Custom Experiment',
      scenarioLabelKo: '사용자 실험 케이스',
      marketplace: marketplace.trim() || 'Synthetic Marketplace',
      targetCountryCode: targetCountryCode.trim().toUpperCase() || 'US',
      targetCountryName: targetCountryName.trim() || 'United States',
      targetCountryNameKo: targetCountryName.trim() || '테스트 국가',
      matchedSku,
      listingTitle: listingTitle.trim(),
      listingDescription: listingDescription.trim(),
      condition,
      listedPrice: parsedPrice,
      currency: currency.trim() || '€',
      officialMsrp: parsedMsrp,
      sellerId: sellerStatus === 'Missing' || !sellerId.trim() ? null : sellerId.trim(),
      sellerStatus,
      trademarkStatus,
      captureTimestamp: includeTimestamp ? new Date().toISOString() : null,
      visualSimilarityScore: parsedScore,
      visualObservation:
        parsedScore < 0.65
          ? 'Simulated CV flagged logo & curve proportion mismatch'
          : 'Simulated CV indicates visual similarity to genuine reference',
      visualObservationKo:
        parsedScore < 0.65
          ? '시뮬레이션 CV가 로고 및 곡선 비율 불일치를 탐지함'
          : '시뮬레이션 CV가 정품 레퍼런스와 유사한 외관을 나타냄',
      visualMode:
        parsedScore < 0.65
          ? 'distorted_logo'
          : condition === 'Pre-owned'
            ? 'authentic_used'
            : 'official_studio',
      listingUrl: `https://synthetic-marketplace.example/custom/${id.toLowerCase()}`,
      approvedSearchQuery: `${targetCountryCode.trim().toUpperCase() || 'GLOBAL'}: custom prompt experiment`,
      isCustom: true,
    };

    onCreate(newRecord, runLiveGemini);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-synthetic-title"
    >
      <div className="w-full max-w-2xl bg-white border border-[#161616] max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#DFDBD2] flex items-center justify-between">
          <div>
            <h2 id="custom-synthetic-title" className="text-base font-semibold text-[#161616]">
              {isKo ? '새 합성 리스팅 실험 입력' : 'New Synthetic Listing Experiment'}
            </h2>
            <p className="text-xs text-[#5A5853] mt-0.5">
              {isKo
                ? '가상의 합성 데이터로 중고 리셀, 필수 정보 누락, 실시간 Gemini 응답 비교를 실험합니다. 실제 기밀 데이터는 입력하지 마세요.'
                : 'Test edge cases (resale context, missing audit fields, or live Gemini rationale) with synthetic inputs only.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isKo ? '합성 실험 모달 닫기' : 'Close synthetic experiment modal'}
            className="p-2 text-[#5A5853] hover:text-[#161616] focus-visible:outline-2 focus-visible:outline-[#E84A27]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 border border-[#B91C1C] bg-[#FEF2F2] text-xs text-[#991B1B]">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-sku" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '매칭 공식 SKU' : 'Matched Official SKU'}
              </label>
              <select
                id="exp-sku"
                value={matchedSku}
                onChange={(e) => setMatchedSku(e.target.value)}
                className="w-full border border-[#CFCAC0] bg-white px-3 py-2 text-sm text-[#161616]"
              >
                {Object.values(GENUINE_SKU_CATALOG).map((item) => (
                  <option key={item.sku} value={item.sku}>
                    {item.sku} — {isKo ? item.productNameKo : item.productName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-marketplace" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '마켓플레이스명' : 'Marketplace Name'}
              </label>
              <input
                id="exp-marketplace"
                type="text"
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm text-[#161616]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="exp-title" className="block text-xs font-medium text-[#161616] mb-1">
              {isKo ? '리스팅 제목 (현지어 / 한국어 / 영어)' : 'Listing Title (Localized / English)'}
            </label>
            <input
              id="exp-title"
              type="text"
              value={listingTitle}
              onChange={(e) => setListingTitle(e.target.value)}
              className="w-full border border-[#CFCAC0] px-3 py-2 text-sm text-[#161616]"
            />
          </div>

          <div>
            <label htmlFor="exp-desc" className="block text-xs font-medium text-[#161616] mb-1">
              {isKo ? '리스팅 설명' : 'Listing Description'}
            </label>
            <textarea
              id="exp-desc"
              rows={2}
              value={listingDescription}
              onChange={(e) => setListingDescription(e.target.value)}
              className="w-full border border-[#CFCAC0] px-3 py-2 text-sm text-[#161616]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="exp-country-code" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '국가 코드' : 'Market Code'}
              </label>
              <input
                id="exp-country-code"
                type="text"
                maxLength={3}
                value={targetCountryCode}
                onChange={(e) => setTargetCountryCode(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label htmlFor="exp-country-name" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '대상 국가' : 'Country'}
              </label>
              <input
                id="exp-country-name"
                type="text"
                value={targetCountryName}
                onChange={(e) => setTargetCountryName(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="exp-price" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? `판매가 (${currency})` : `Listed Price (${currency})`}
              </label>
              <input
                id="exp-price"
                type="number"
                value={listedPrice}
                onChange={(e) => setListedPrice(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="exp-msrp" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? `공식 MSRP (${currency})` : `Official MSRP (${currency})`}
              </label>
              <input
                id="exp-msrp"
                type="number"
                value={officialMsrp}
                onChange={(e) => setOfficialMsrp(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="exp-condition" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '상품 상태' : 'Item Condition'}
              </label>
              <select
                id="exp-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full border border-[#CFCAC0] bg-white px-3 py-2 text-sm"
              >
                <option value="New">{isKo ? '새상품 (New)' : 'New'}</option>
                <option value="Pre-owned">{isKo ? '중고 (Pre-owned Resale)' : 'Pre-owned (Resale)'}</option>
                <option value="Unspecified">{isKo ? '미표기 (Unspecified)' : 'Unspecified'}</option>
              </select>
            </div>
            <div>
              <label htmlFor="exp-seller-status" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '판매자 권한 상태' : 'Seller Authorization'}
              </label>
              <select
                id="exp-seller-status"
                value={sellerStatus}
                onChange={(e) => setSellerStatus(e.target.value as SellerStatus)}
                className="w-full border border-[#CFCAC0] bg-white px-3 py-2 text-sm"
              >
                <option value="Unlisted">{isKo ? '미등록 판매자 (Unlisted)' : 'Unlisted Seller'}</option>
                <option value="Whitelisted">{isKo ? '공식 파트너 (Whitelisted)' : 'Whitelisted Partner'}</option>
                <option value="Missing">{isKo ? '누락 (Missing / Null)' : 'Missing / Null'}</option>
              </select>
            </div>
            <div>
              <label htmlFor="exp-tm" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '국가별 상표권 상태' : 'Regional Trademark'}
              </label>
              <select
                id="exp-tm"
                value={trademarkStatus}
                onChange={(e) => setTrademarkStatus(e.target.value as TrademarkStatus)}
                className="w-full border border-[#CFCAC0] bg-white px-3 py-2 text-sm"
              >
                <option value="Active">{isKo ? '유효 (Active)' : 'Active'}</option>
                <option value="Pending">{isKo ? '확인 대기 (Pending)' : 'Pending'}</option>
                <option value="Unregistered">{isKo ? '미등록 (Unregistered)' : 'Unregistered'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="exp-seller-id" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '판매자 ID' : 'Seller ID'}
              </label>
              <input
                id="exp-seller-id"
                type="text"
                disabled={sellerStatus === 'Missing'}
                value={sellerStatus === 'Missing' ? '' : sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                placeholder="Seller handle"
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono disabled:bg-[#F3F1EC]"
              />
            </div>
            <div>
              <label htmlFor="exp-cv" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '시뮬레이션 CV 점수 (0–1)' : 'Simulated CV Score (0–1)'}
              </label>
              <input
                id="exp-cv"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={visualSimilarityScore}
                onChange={(e) => setVisualSimilarityScore(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="exp-currency" className="block text-xs font-medium text-[#161616] mb-1">
                {isKo ? '통화 기호' : 'Currency Symbol'}
              </label>
              <input
                id="exp-currency"
                type="text"
                maxLength={4}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-[#CFCAC0] px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-[#EAE6DD]">
            <label className="inline-flex items-center gap-2 text-xs text-[#161616] cursor-pointer">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="accent-[#E84A27]"
              />
              {isKo ? '유효한 UTC 수집 타임스탬프 포함' : 'Include valid UTC Capture Timestamp'}
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-[#161616] cursor-pointer">
              <input
                type="checkbox"
                checked={runLiveGemini}
                onChange={(e) => setRunLiveGemini(e.target.checked)}
                className="accent-[#E84A27]"
              />
              {isKo
                ? '추가 즉시 실시간 Gemini 비교 분석 실행'
                : 'Evaluate immediately with Live Gemini (gemini-4-hydrogen)'}
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#DFDBD2]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-[#CFCAC0] text-[#161616] hover:bg-[#FAF8F5] whitespace-nowrap shrink-0"
            >
              {isKo ? '취소' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#E84A27] text-white hover:bg-[#D13D1C] whitespace-nowrap shrink-0"
            >
              {isKo ? '심사 큐에 추가' : 'Add to Triage Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
