/**
 * Translates SQLite/D1 `?` placeholders to PostgreSQL `$1`, `$2`, … numbering.
 * Repository SQL is authored once with `?` for D1 compatibility.
 */
export function translateQuestionMarkPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}
