export const CODENAME_MAX_RETRIES = 3;

export const RETRIEVAL_MEMORY_SELECT = `id, title, project, '' as content, summary, tags, favorite, archived,
  owner_id, created_at, updated_at, codename, slug, keywords, category, memory_type,
  importance, language, notes, project_id, level, last_accessed, access_count,
  embedding_id, object_key, semantic_hash, aliases, source_path, lifecycle_state`;

export const MEMORY_SELECT = `id, title, project, content, summary, tags, favorite, archived,
  owner_id, created_at, updated_at, codename, slug, keywords, category, memory_type,
  importance, language, notes, project_id, level, last_accessed, access_count,
  embedding_id, object_key, semantic_hash, aliases, source_path, workspace_id, last_modified_by_agent_id, lifecycle_state`;
