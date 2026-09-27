export interface PollOptions {
  timeoutMs?: number;
  intervalMs?: number;
  errorMessage?: string;
}

export async function pollUntil<T>(
  action: () => Promise<T>,
  predicate: (result: T) => boolean,
  options?: PollOptions,
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const intervalMs = options?.intervalMs ?? 500;
  const errorMessage = options?.errorMessage ?? 'Polling timed out without condition being met';
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const result = await action();
    if (predicate(result)) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`${errorMessage} (timeout: ${timeoutMs}ms)`);
}

export async function retry<T>(
  action: () => Promise<T>,
  attempts = 3,
  delayMs = 1_000,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await action();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
