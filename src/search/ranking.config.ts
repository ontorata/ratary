export const SEARCH_CANDIDATE_CAP = 500;

export const RANKING_WEIGHTS = {
  codenameExact: 100,
  codenameContains: 80,
  titleExact: 90,
  titleContains: 70,
  keywordMatch: 60,
  tagMatch: 55,
  summaryContains: 50,
  projectExact: 40,
  projectContains: 25,
  contentContains: 20,
  favoriteBonus: 10,
} as const;
