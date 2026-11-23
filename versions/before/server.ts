import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { evaluateDeterministicTriage } from './src/domain/triageRules.ts';
import type {
  GenuineSkuReference,
  Locale,
  RiskClassification,
  SuspectListingRecord,
  TriageEvaluation,
} from './src/domain/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add a valid key in Settings > Secrets to run live experimental AI triage.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
      ),
    });
  });

  app.post('/api/triage/analyze', async (req, res) => {
    try {
      const body = req.body as {
        listing?: SuspectListingRecord;
        skuRef?: GenuineSkuReference;
        locale?: Locale;
      };

      if (!body?.listing || !body?.skuRef) {
        res.status(400).json({ error: 'Missing required listing or skuRef payload.' });
        return;
      }

      const locale: Locale = body.locale === 'en' ? 'en' : 'ko';
      const deterministic = evaluateDeterministicTriage(body.listing, body.skuRef, locale);

      const ai = getGeminiClient();

      const languageInstruction =
        locale === 'ko'
          ? 'Respond in natural, concise Korean (한국어) for all text fields (rationaleBullets, thresholdExplanation, draftTakedownSummary, caveats).'
          : 'Respond in clear, concise English for all text fields.';

      const prompt = [
        'You are an experimental AI assistant supporting an in-house Brand Protection Specialist for the fashion brand AJOU.',
        languageInstruction,
        'Evaluate the suspect marketplace listing against the genuine SKU reference and structured metadata.',
        'Important rules:',
        '1. Do NOT invent facts not present in the provided record.',
        '2. Explicitly respect secondhand/first-sale resale context if condition is Pre-owned or receipt/wear is mentioned without replica claims.',
        '3. If mandatory audit fields are missing (Seller ID, Capture Timestamp, or Trademark Status != Active), classify as HOLD_MISSING_DATA and do NOT produce an actionable takedown notice.',
        '4. Be concise, objective, and highlight any ambiguity or limitation.',
        '',
        `Mandatory Audit Valid: ${deterministic.mandatoryAudit.valid} (Missing: ${deterministic.mandatoryAudit.missingFields.join(', ') || 'None'})`,
        `Calculated Price Deviation: ${deterministic.priceDeviationPct}%`,
        `Listing JSON: ${JSON.stringify(body.listing)}`,
        `Genuine SKU Reference JSON: ${JSON.stringify(body.skuRef)}`,
      ].join('\n');

      const generateWithRetry = async () => {
        const call = () =>
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction:
                'Return strict JSON for counterfeit risk triage. Keep rationale bullets concise (max 4 bullets) and factual. Keep draftTakedownSummary under 90 words.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  classification: {
                    type: Type.STRING,
                    enum: ['HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK', 'HOLD_MISSING_DATA'],
                  },
                  recommendedAction: {
                    type: Type.STRING,
                    enum: ['APPROVED_TAKEDOWN', 'HOLD_VERIFICATION', 'DISMISSED_LEGITIMATE'],
                  },
                  rationaleBullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  thresholdExplanation: {
                    type: Type.STRING,
                  },
                  draftTakedownSummary: {
                    type: Type.STRING,
                  },
                  caveats: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'classification',
                  'recommendedAction',
                  'rationaleBullets',
                  'thresholdExplanation',
                  'draftTakedownSummary',
                  'caveats',
                ],
              },
            },
          });

        try {
          return await call();
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
            await new Promise((r) => setTimeout(r, 900));
            return await call();
          }
          throw err;
        }
      };

      const response = await generateWithRetry();

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini returned an empty response.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        classification: RiskClassification;
        recommendedAction: TriageEvaluation['recommendedAction'];
        rationaleBullets: string[];
        thresholdExplanation: string;
        draftTakedownSummary: string;
        caveats: string[];
      };

      const enforcedClassification: RiskClassification = !deterministic.mandatoryAudit.valid
        ? 'HOLD_MISSING_DATA'
        : parsed.classification;

      const enforcedRecommendedAction: TriageEvaluation['recommendedAction'] =
        !deterministic.mandatoryAudit.valid ? 'HOLD_VERIFICATION' : parsed.recommendedAction;

      const result: TriageEvaluation = {
        ...deterministic,
        classification: enforcedClassification,
        recommendedAction: enforcedRecommendedAction,
        rationaleBullets:
          Array.isArray(parsed.rationaleBullets) && parsed.rationaleBullets.length > 0
            ? parsed.rationaleBullets.slice(0, 4)
            : deterministic.rationaleBullets,
        thresholdExplanation:
          parsed.thresholdExplanation || deterministic.thresholdExplanation,
        draftTakedownSummary: !deterministic.mandatoryAudit.valid
          ? deterministic.draftTakedownSummary
          : parsed.draftTakedownSummary || deterministic.draftTakedownSummary,
        analysisSource: 'Live Gemini (gemini-4-hydrogen)',
        caveats:
          Array.isArray(parsed.caveats) && parsed.caveats.length > 0
            ? parsed.caveats.slice(0, 3)
            : deterministic.caveats,
      };

      res.json({ evaluation: result });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Unknown Gemini API error';
      let cleanMessage = rawMessage;
      let statusCode = 500;
      if (rawMessage.includes('503') || rawMessage.includes('UNAVAILABLE')) {
        statusCode = 503;
        cleanMessage =
          'Gemini model is temporarily busy (503 UNAVAILABLE). Deterministic baseline remains active; please retry shortly.';
      }
      res.status(statusCode).json({ error: cleanMessage });
    }
  });

  return app;
}

async function startServer() {
  const app = createApiApp();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Anti-Counterfeit Solution listening on http://localhost:${PORT}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  });
}
