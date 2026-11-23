import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function reviewAll(page: Page) {
  for (const id of ['wording', 'price', 'visual', 'seller', 'capture', 'rights']) await page.getByTestId(`review-${id}`).check();
}

for (const locale of ['en', 'ko']) {
  test(`full evidence selection and documented decision in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    if (locale === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
    await expect(page.getByRole('heading', { name: /HIGH RISK/ })).toBeVisible();
    await expect(page.getByTestId('cv-explanation')).toContainText(locale === 'en' ? 'simulation input' : '시뮬레이션 입력');
    await expect(page.getByTestId('evidence-visual')).toContainText('0.42');
    await page.getByRole('button', { name: locale === 'en' ? 'Threshold Rubric' : '위험 등급 기준표', exact: true }).click();
    await expect(page.getByText(/<= -60%/).first()).toBeVisible();
    const hold = page.getByRole('button', { name: locale === 'en' ? 'Hold for Verification' : '추가 검증 보류', exact: true });
    const approve = page.getByRole('button', { name: locale === 'en' ? 'Approve Takedown Report' : '신고서 승인', exact: true });
    await expect(hold).toBeDisabled();
    await expect(approve).toBeDisabled();
    await expect(page.getByTestId('include-price')).toBeDisabled();
    await expect(page.getByTestId('report-draft')).not.toHaveValue(/€45/);
    await reviewAll(page);
    await page.getByTestId('include-wording').check();
    await page.getByTestId('include-price').check();
    await expect(page.getByTestId('report-draft')).toHaveValue(/€45/);
    await page.getByTestId('include-price').uncheck();
    await expect(page.getByTestId('report-draft')).not.toHaveValue(/€45|\[price\]/);
    await page.getByRole('button', { name: locale === 'en' ? 'Preview selected evidence package' : '선택 근거 패키지 미리보기', exact: true }).click();
    await expect(page.getByTestId('package-text')).not.toContainText('€45');
    await expect(page.getByRole('dialog')).toContainText(locale === 'en' ? 'Preview is not approval' : '미리보기는 승인이 아닙니다');
    await page.getByRole('button', { name: locale === 'en' ? 'Close' : '닫기', exact: true }).click();
    await page.getByTestId('confirm-evidence').check();
    await expect(hold).toBeDisabled();
    await page.locator('#decision-driver').selectOption('REPLICA_KEYWORDS');
    await page.locator('#override-note').fill(locale === 'en' ? 'Verify local wording and independent rights before any complaint.' : '현지어 의미와 실제 권리를 독립 확인한 뒤 신고 여부를 판단합니다.');
    await expect(hold).toBeEnabled();
    await expect(approve).toBeDisabled();
    await hold.click();
    await expect(page.getByRole('status')).toContainText(locale === 'en' ? 'snapshot recorded' : '스냅샷을 기록');
    await page.getByText(locale === 'en' ? 'Selected evidence and draft snapshot' : '선택 근거와 초안 스냅샷', { exact: true }).click();
    await expect(page.getByText('evidence-draft-v1', { exact: true })).toBeVisible();
    await mkdir('docs/screenshots', { recursive: true });
    await page.screenshot({ path: `docs/screenshots/after-${locale}.png`, fullPage: true });
    // Changing evidence invalidates confirmation and never rewrites the historical snapshot.
    await page.getByTestId('include-price').check();
    await expect(page.getByTestId('confirm-evidence')).not.toBeChecked();
    await expect(hold).toBeDisabled();
    await expect(page.locator('pre').last()).not.toContainText('€45');
    expect(errors).toEqual([]);
  });
}

test('the incomplete sample explains the missing fields and locks approval', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'AJOU-SYN-005' }).click();
  await expect(page.getByTestId('missing-evidence-warning')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve Takedown Report', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Show sample AI result' }).click();
  await expect(page.getByTestId('prepared-ai-result')).toContainText('local trademark status is unconfirmed');
  await page.getByTestId('evidence-rights').getByText('Details · Source and limitations').click();
  await expect(page.getByTestId('evidence-rights')).toContainText('Not independently verified');
});

test('resale case is low risk and dismissal requires a reviewed rationale', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'AJOU-SYN-002' }).click();
  await expect(page.getByTestId('resale-context-indicator')).toBeVisible();
  await expect(page.getByRole('heading', { name: /LOW RISK/ })).toBeVisible();
  await reviewAll(page);
  await page.getByTestId('include-seller').check();
  await page.getByTestId('confirm-evidence').check();
  await page.locator('#override-note').fill('Resale cues support dismissal in this synthetic exercise.');
  await page.getByRole('button', { name: 'Dismiss as Legitimate', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('snapshot recorded');
});

test('prepared output is shown locally and leaves evidence and approval unchanged', async ({ page }) => {
  const analysisRequests: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') analysisRequests.push(request.url());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByTestId('prepared-ai-result')).toBeHidden();
  await page.getByRole('button', { name: 'Show sample AI result' }).click();
  await expect(page.getByTestId('prepared-ai-result')).toContainText('€45 versus a €290 reference price');
  await expect(page.getByRole('heading', { name: /HIGH RISK/ })).toBeVisible();
  await expect(page.getByTestId('report-draft')).not.toHaveValue(/€45/);
  await expect(page.getByRole('button', { name: 'Approve Takedown Report', exact: true })).toBeDisabled();
  expect(analysisRequests).toEqual([]);
});

test('prepared output follows the selected sample and language', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button').filter({ hasText: 'AJOU-SYN-002' }).click();
  await page.getByRole('button', { name: '예시 AI 결과 보기' }).click();
  await expect(page.getByTestId('prepared-ai-result')).toContainText('영수증');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByTestId('prepared-ai-result')).toContainText('receipt');
});

test('mobile evidence review has no page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByTestId('review-wording')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
