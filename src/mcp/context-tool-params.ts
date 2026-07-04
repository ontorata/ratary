/** MCP get_context / build_prompt token-efficiency flags. */
export function resolveIncludeSummaryOnly(params: {
  content_mode?: 'summary' | 'full';
  summary_only?: boolean;
  summaryOnly?: boolean;
  include_body?: boolean;
  includeBody?: boolean;
}): boolean {
  if (params.content_mode === 'full') return false;
  if (params.content_mode === 'summary') return true;

  const includeBody = params.include_body === true || params.includeBody === true;
  if (includeBody) return false;

  const summaryOnly = params.summary_only ?? params.summaryOnly;
  return summaryOnly ?? true;
}
