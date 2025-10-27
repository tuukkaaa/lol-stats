import { patch2520 } from './patch-25-20.js';
export const allPatches = [patch2520];
export { patch2520 };
export const getPatchBySlug = slug => {
  return allPatches.find(patch => patch.slug === slug);
};
export const getRecentPatches = (limit = 6) => {
  return allPatches.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
};
export const getAllSlugs = () => {
  return allPatches.map(patch => patch.slug);
};