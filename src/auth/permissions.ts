export const PERMISSIONS = {
  MEMORY_READ: 'memory.read',
  MEMORY_WRITE: 'memory.write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(granted: string[], required: Permission): boolean {
  return granted.includes(required);
}

export function resolveRequiredPermission(method: string, path: string): Permission | null {
  const normalized = path.split('?')[0] ?? path;

  if (isPublicOrAuthPath(normalized)) {
    return null;
  }

  if (method === 'GET' || method === 'HEAD') {
    return PERMISSIONS.MEMORY_READ;
  }

  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return PERMISSIONS.MEMORY_WRITE;
  }

  return null;
}

function isPublicOrAuthPath(path: string): boolean {
  if (path === '/' || path === '/health' || path === '/api/v1/health') return true;
  if (path.startsWith('/docs')) return true;
  if (path.startsWith('/api/v1/auth/')) return true;
  return false;
}
