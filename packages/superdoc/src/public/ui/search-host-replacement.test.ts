import { describe, expect, it, vi } from 'vite-plus/test';
import { createSuperDocUI } from './create-super-doc-ui.js';

function mountSearch(operation: () => unknown) {
  let state = { query: 'Trustee', total: 2, activeMatchIndex: 0, matches: [{}, {}], canReplace: true };
  const hostSearch = {
    setSession: vi.fn(() => state),
    getState: () => state,
    clear: () => {
      state = { ...state, query: '', total: 0, activeMatchIndex: -1, matches: [] };
    },
    replaceCurrent: vi.fn(operation),
    replaceAll: vi.fn(operation),
  };
  const ui = createSuperDocUI({
    superdoc: { activeEditor: { editorVersion: 2, host: { search: hostSearch }, doc: {} } } as never,
  });
  ui.search.find('Trustee');
  return { ui, hostSearch };
}

describe.each(['replace', 'replaceAll'] as const)('public host search.%s (SD-5351)', (method) => {
  it('waits for the eventual committed outcome', async () => {
    let settle!: (result: unknown) => void;
    const { ui } = mountSearch(
      () =>
        new Promise((resolve) => {
          settle = resolve;
        }),
    );
    const pending = ui.search[method]('Fiduciary');
    expect(pending).toBeInstanceOf(Promise);
    settle({ status: 'committed', replaced: method === 'replace' ? 1 : 2 });
    await expect(pending).resolves.toEqual({ ok: true });
    ui.destroy();
  });

  it('returns the committed result after close without republishing search state', async () => {
    let settle!: (result: unknown) => void;
    const { ui } = mountSearch(
      () =>
        new Promise((resolve) => {
          settle = resolve;
        }),
    );
    const pending = ui.search[method]('Fiduciary');
    ui.search.close();
    const emissions: number[] = [];
    ui.search.subscribe(() => emissions.push(ui.search.getSnapshot().total));
    settle({ status: 'committed', total: 99, activeMatchIndex: 0 });
    await expect(Promise.resolve(pending)).resolves.toEqual({ ok: true });
    expect(emissions).not.toContain(99);
    expect(ui.search.getSnapshot()).toMatchObject({ total: 0, open: false });
    ui.destroy();
  });

  it('maps a rejected Promise to a truthful search failure', async () => {
    const { ui } = mountSearch(() => {
      const promise = Promise.reject(new Error('worker unavailable'));
      void promise.catch(() => {});
      return promise;
    });
    await expect(Promise.resolve(ui.search[method]('Fiduciary'))).resolves.toEqual({
      ok: false,
      reason: 'search-unavailable',
    });
    ui.destroy();
  });

  it.each([
    [{ status: 'rejected', reason: 'truncated' }, 'search-truncated'],
    [{ status: 'receipt-failure', failure: { code: 'REVISION_MISMATCH' } }, 'target-unresolved'],
  ])('preserves the specific rejection for %j', async (outcome, reason) => {
    const { ui } = mountSearch(() => outcome);
    expect(await ui.search[method]('Fiduciary')).toEqual({ ok: false, reason });
    ui.destroy();
  });

  it('preserves a synchronous success result', () => {
    const { ui } = mountSearch(() => ({ status: 'committed', replaced: 1 }));
    expect(ui.search[method]('Fiduciary')).toEqual({ ok: true });
    ui.destroy();
  });
});

it('names a capped fallback rejection and does not call the mutation', async () => {
  const replaceAll = vi.fn();
  const ui = createSuperDocUI({
    superdoc: {
      activeEditor: {
        editorVersion: 2,
        doc: {},
        editCommands: {
          search: {
            query: () => ({}),
            getState: () => ({ query: 'Trustee', total: 1001, activeIndex: 0 }),
            replaceAll,
          },
          getSnapshot: () => ({ commands: { 'find.replaceAll': { enabled: false, reason: 'search-truncated' } } }),
        },
      },
    } as never,
  });
  ui.search.find('Trustee');
  expect(ui.search.getSnapshot().canReplaceAll).toBe(false);
  expect(await ui.search.replaceAll('Fiduciary')).toEqual({ ok: false, reason: 'search-truncated' });
  expect(replaceAll).not.toHaveBeenCalled();
  ui.destroy();
});
