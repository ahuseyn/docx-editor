const FLASH_CLASS = 'sd-page-number-flash';
const FLASH_MS = 1400;

const nextFrame = (view) =>
  new Promise((resolve) => {
    if (typeof view?.requestAnimationFrame === 'function') view.requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 16);
  });

/**
 * Briefly highlight the painted header or footer regions that are on screen,
 * so the user sees where page numbers landed without the caret leaving the
 * body. Regions are read after the repaint that follows the mutation; nothing
 * happens when none is visible or the host is unavailable.
 *
 * @param {HTMLElement | null | undefined} host Document viewport host element.
 * @param {'header' | 'footer'} kind
 */
export async function flashPageNumberRegions(host, kind) {
  const view = host?.ownerDocument?.defaultView;
  if (!host || !view) return;
  await nextFrame(view);
  await nextFrame(view);
  const viewportHeight = view.innerHeight;
  const regions = [...host.querySelectorAll(`[data-sd-headerfooter-kind="${kind}"]`)].filter((region) => {
    const rect = region.getBoundingClientRect();
    return rect.height > 0 && rect.bottom > 0 && rect.top < viewportHeight;
  });
  for (const region of regions) {
    region.classList.remove(FLASH_CLASS);
    region.classList.add(FLASH_CLASS);
    view.setTimeout(() => region.classList.remove(FLASH_CLASS), FLASH_MS);
  }
}
