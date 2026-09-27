import type { Request } from '@playwright/test';

/**
 * Parses route payload:
 * - form-urlencoded -> object
 * - JSON content-type or `{`/`[` body -> JSON.parse
 * - empty body -> {}
 * - otherwise raw string
 */
export function parseRoutePayload(request: Request): unknown {
  const postData = request.postData();
  if (!postData || postData.trim().length === 0) {
    return {};
  }

  const contentType = request.headers()['content-type'] ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(postData);
    const obj: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  const trimmed = postData.trim();
  if (
    contentType.includes('application/json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')
  ) {
    try {
      return JSON.parse(postData) as unknown;
    } catch {
      return postData;
    }
  }

  return postData;
}
