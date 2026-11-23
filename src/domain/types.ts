export type Locale = 'ko' | 'en';

export type RiskClassification =
  | 'HIGH_RISK'
  | 'MEDIUM_RISK'
  | 'LOW_RISK'
  | 'HOLD_MISSING_DATA';

export type SellerStatus = 'Whitelisted' | 'Unlisted' | 'Missing';

export type TrademarkStatus = 'Active' | 'Pending' | 'Unregistered';

export type ListingCondition = 'New' | 'Pre-owned' | 'Unspecified';

export type HumanActionType =
  | 'PENDING'
  | 'APPROVED_TAKEDOWN'
  | 'HOLD_VERIFICATION'
  | 'DISMISSED_LEGITIMATE';

export type DecisionDriver =
  | 'PRICE_ANOMALY'
  | 'REPLICA_KEYWORDS'
  | 'VISUAL_MISMATCH'
  | 'RESALE_CONTEXT'
  | 'AUTHORIZED_WHITELIST'
  | 'MISSING_AUDIT_DATA'
  | 'OTHER';

export type VisualDefectMode =
  | 'distorted_logo'
  | 'authentic_used'
  | 'official_studio'
  | 'unclear_serial'
  | 'blurry_lowres';

export interface GenuineSkuReference {
  sku: string;
  productName: string;
  productNameKo: string;
  category: string;
  categoryKo: string;
  silhouetteNote: string;
  silhouetteNoteKo: string;
  keyDetails: string[];
  officialCopy: string;
  officialCopyKo: string;
  rightsRecordId: string;
  officialMsrpByMarket: Record<string, { currency: string; amount: number }>;
}

export interface SuspectListingRecord {
  id: string;
  demoOrder?: number;
  scenarioLabel: string;
  scenarioLabelKo: string;
  marketplace: string;
  targetCountryCode: string;
  targetCountryName: string;
  targetCountryNameKo: string;
  matchedSku: string;
  listingTitle: string;
  listingTitleKo?: string;
  listingDescription: string;
  listingDescriptionKo?: string;
  condition: ListingCondition;
  listedPrice: number;
  currency: string;
  officialMsrp: number;
  sellerId: string | null;
  sellerStatus: SellerStatus;
  trademarkStatus: TrademarkStatus;
  captureTimestamp: string | null;
  visualSimilarityScore: number;
  visualObservation: string;
  visualObservationKo: string;
  visualMode: VisualDefectMode;
  listingUrl: string;
  approvedSearchQuery: string;
  isCustom?: boolean;
}

export interface EvidenceCheckItem {
  label: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
  originTag: 'External' | 'Internal' | 'Newly Collected';
  curationLimitation: string;
}

export interface TriageEvaluation {
  classification: RiskClassification;
  priceDeviationPct: number;
  suspiciousKeywords: string[];
  resaleSignals: string[];
  isLegitimateResaleContext: boolean;
  mandatoryAudit: {
    valid: boolean;
    missingFields: string[];
    reasons: string[];
  };
  isApprovalLocked: boolean;
  lockReason: string | null;
  rationaleBullets: string[];
  thresholdExplanation: string;
  evidenceChecks: EvidenceCheckItem[];
  draftTakedownSummary: string;
  recommendedAction: Exclude<HumanActionType, 'PENDING'>;
  analysisSource: 'Deterministic Baseline' | 'Live Gemini (gemini-4-hydrogen)';
  caveats: string[];
}

export interface AuditLogEntry {
  id: string;
  caseId: string;
  productName: string;
  aiClassification: RiskClassification;
  humanAction: Exclude<HumanActionType, 'PENDING'>;
  decisionDriver: DecisionDriver;
  overrodeAi: boolean;
  note: string;
  timestamp: string;
}

export interface AiExperimentNote {
  caseId: string;
  issueType: 'NONE' | 'INCORRECT' | 'UNCLEAR' | 'UNSUPPORTED' | 'INCONSISTENT';
  note: string;
  timestamp: string;
}
