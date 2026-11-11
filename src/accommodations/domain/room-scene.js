// Convert wall openings into solid rectangles, preserving real door/window gaps.
export function wallPanels(wall) {
  const length = Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
  if (!Number.isFinite(length) || length <= 0 || wall.heightM <= 0) return [];
  const openings = (wall.openings || []).map(item => ({
    left: Math.max(0, item.offsetM), right: Math.min(length, item.offsetM + item.widthM),
    bottom: Math.max(0, item.sillM), top: Math.min(wall.heightM, item.sillM + item.heightM),
  })).filter(item => item.right > item.left && item.top > item.bottom);
  const xs = [...new Set([0, length, ...openings.flatMap(item => [item.left, item.right])])].sort((a,b) => a-b);
  const ys = [...new Set([0, wall.heightM, ...openings.flatMap(item => [item.bottom, item.top])])].sort((a,b) => a-b);
  const panels = [];
  for (let x = 1; x < xs.length; x++) {
    for (let y = 1; y < ys.length; y++) {
      const cx = (xs[x-1] + xs[x])/2, cy = (ys[y-1] + ys[y])/2;
      if (!openings.some(item => cx > item.left && cx < item.right && cy > item.bottom && cy < item.top))
        panels.push({ x: cx, y: cy, width: xs[x]-xs[x-1], height: ys[y]-ys[y-1] });
    }
  }
  return panels;
}
export function validScene(scene) {
  return !!(scene?.room && ['widthM','lengthM','heightM'].every(key => Number.isFinite(scene.room[key]) && scene.room[key] > 0) &&
    Array.isArray(scene.walls) && Array.isArray(scene.beds));
}
export function panoramaUrl(path, origin) {
  const url = new URL(path, origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== new URL(origin).origin)
    throw new Error('Panoramas must use the configured gateway.');
  return url.href;
}
