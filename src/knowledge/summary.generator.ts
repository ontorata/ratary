const MAX_SUMMARY_LENGTH = 300;

export function generateSummary(content: string): string {
  const stripped = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length <= MAX_SUMMARY_LENGTH) {
    return stripped;
  }

  return `${stripped.slice(0, MAX_SUMMARY_LENGTH - 1).trimEnd()}…`;
}

export const SUMMARY_MAX_LENGTH = MAX_SUMMARY_LENGTH;
