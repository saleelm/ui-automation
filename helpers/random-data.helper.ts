import crypto from 'node:crypto';

export function randomString(length = 8, prefix = ''): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    str += chars[idx];
  }
  return prefix ? `${prefix}-${str}` : str;
}

export function randomEmail(domain = 'example.com'): string {
  return `test-${randomString(10)}@${domain}`;
}

export function randomUuid(): string {
  return crypto.randomUUID();
}

export function randomNumber(min = 1, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
