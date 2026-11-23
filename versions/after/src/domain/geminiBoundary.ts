import type { GeminiAnalysis, Locale, SuspectListingRecord } from './types';
import { GENUINE_SKU_CATALOG } from './syntheticCases';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 4 && value.every(v => typeof v === 'string' && v.length > 0 && v.length <= 1500);
}
export function parseGeminiAnalysis(value: unknown): GeminiAnalysis | null {
  if (!isObject(value)) return null;
  const { classification, recommendedAction, rationaleBullets, caveats } = value;
  if (classification !== 'HIGH_RISK' && classification !== 'MEDIUM_RISK' && classification !== 'LOW_RISK' && classification !== 'HOLD_MISSING_DATA') return null;
  if (recommendedAction !== 'APPROVED_TAKEDOWN' && recommendedAction !== 'HOLD_VERIFICATION' && recommendedAction !== 'DISMISSED_LEGITIMATE') return null;
  if (!isTextArray(rationaleBullets) || rationaleBullets.length === 0 || !isTextArray(caveats)) return null;
  // Discard all other fields, including generated drafts, verification states and lock overrides.
  return { classification, recommendedAction, rationaleBullets, caveats };
}

export function parseAnalyzeRequest(value: unknown): { listing: SuspectListingRecord; locale: Locale } | null {
  if (!isObject(value) || !isObject(value.listing)) return null;
  const r = value.listing;
  const { id, scenarioLabel, scenarioLabelKo, marketplace, targetCountryCode, targetCountryName, targetCountryNameKo,
    matchedSku, listingTitle, listingDescription, currency, visualObservation, visualObservationKo, listingUrl, approvedSearchQuery,
    condition, listedPrice, officialMsrp, sellerId, sellerStatus, trademarkStatus, captureTimestamp, visualSimilarityScore, visualMode } = r;
  if (typeof id !== 'string' || typeof scenarioLabel !== 'string' || typeof scenarioLabelKo !== 'string' ||
    typeof marketplace !== 'string' || typeof targetCountryCode !== 'string' || typeof targetCountryName !== 'string' || typeof targetCountryNameKo !== 'string' ||
    typeof matchedSku !== 'string' || !Object.hasOwn(GENUINE_SKU_CATALOG, matchedSku) || typeof listingTitle !== 'string' || typeof listingDescription !== 'string' ||
    typeof currency !== 'string' || typeof visualObservation !== 'string' || typeof visualObservationKo !== 'string' || typeof listingUrl !== 'string' || typeof approvedSearchQuery !== 'string') return null;
  if (Object.values(r).some(v => typeof v === 'string' && v.length > 5000)) return null;
  if (condition !== 'New' && condition !== 'Pre-owned' && condition !== 'Unspecified') return null;
  if (sellerStatus !== 'Whitelisted' && sellerStatus !== 'Unlisted' && sellerStatus !== 'Missing') return null;
  if (trademarkStatus !== 'Active' && trademarkStatus !== 'Pending' && trademarkStatus !== 'Unregistered') return null;
  if (visualMode !== 'distorted_logo' && visualMode !== 'authentic_used' && visualMode !== 'official_studio' && visualMode !== 'unclear_serial' && visualMode !== 'blurry_lowres') return null;
  if (typeof listedPrice !== 'number' || !Number.isFinite(listedPrice) || listedPrice < 0 ||
    typeof officialMsrp !== 'number' || !Number.isFinite(officialMsrp) || officialMsrp <= 0 ||
    typeof visualSimilarityScore !== 'number' || !Number.isFinite(visualSimilarityScore) || visualSimilarityScore < 0 || visualSimilarityScore > 1) return null;
  if ((sellerId !== null && typeof sellerId !== 'string') || (captureTimestamp !== null && typeof captureTimestamp !== 'string')) return null;
  if (value.locale !== 'ko' && value.locale !== 'en') return null;
  return { locale: value.locale, listing: { id, scenarioLabel, scenarioLabelKo, marketplace, targetCountryCode, targetCountryName, targetCountryNameKo,
    matchedSku, listingTitle, listingDescription, currency, visualObservation, visualObservationKo, listingUrl, approvedSearchQuery,
    condition, listedPrice, officialMsrp, sellerId, sellerStatus, trademarkStatus, captureTimestamp, visualSimilarityScore, visualMode } };
}
