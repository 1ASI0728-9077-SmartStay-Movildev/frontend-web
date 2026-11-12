const blockedRouteNames = new Set(['login', 'forbidden', 'notFound']);

export function resolveInternalReturn(router, destination) {
  if (typeof destination !== 'string' || !destination.startsWith('/') ||
      destination.startsWith('//') || destination.includes('\\') || /[\u0000-\u001f]/.test(destination)) return null;

  const resolved = router.resolve(destination);
  if (!resolved.name || !resolved.matched.length || blockedRouteNames.has(resolved.name)) return null;
  return { path: resolved.path, query: resolved.query, hash: resolved.hash };
}
