import { TestInfo } from '@playwright/test';

export interface LinkCheckResult {
    url: string;
    status: number | 'error';
    type: 'link' | 'image';
    error?: string;
}

/**
 * Attaches a page load time annotation to the Ortoni/HTML report.
 */
export function attachPageLoadTime(testInfo: TestInfo, pageName: string, durationMs: number) {
    testInfo.annotations.push({
        type: `⏱ Page Load: ${pageName}`,
        description: `${durationMs}ms`
    });
}

/**
 * Attaches a full link check summary (all checked URLs + broken ones) to the report.
 */
export async function attachLinkCheckResults(
    testInfo: TestInfo,
    results: LinkCheckResult[],
    checkType: 'Links' | 'Images'
) {
    const total = results.length;
    const broken = results.filter(r => r.status === 'error' || (r.status as number) >= 400);
    const passed = total - broken.length;

    // Short annotation for quick visibility
    testInfo.annotations.push({
        type: `🔗 ${checkType} Checked`,
        description: `Total: ${total} | ✅ Passed: ${passed} | ❌ Broken: ${broken.length}`
    });

    // Detailed attachment with all results as JSON
    const reportData = {
        summary: { total, passed, broken: broken.length },
        brokenItems: broken.map(r => ({
            url: r.url,
            status: r.status,
            ...(r.error ? { error: r.error } : {})
        })),
        allItems: results.map(r => ({
            url: r.url,
            status: r.status,
            ok: r.status !== 'error' && (r.status as number) < 400
        }))
    };

    await testInfo.attach(`${checkType} Check Report`, {
        body: JSON.stringify(reportData, null, 2),
        contentType: 'application/json'
    });
}
