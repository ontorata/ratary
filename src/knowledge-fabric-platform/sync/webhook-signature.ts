import { createHmac, timingSafeEqual } from 'node:crypto';

export function signWebhookPayload(secret: string, rawBody: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  if (!secret.trim() || !signatureHeader?.trim()) return false;
  const expected = signWebhookPayload(secret, rawBody);
  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  if (expected.length !== provided.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
  } catch {
    return false;
  }
}
