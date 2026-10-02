import type {
  BookmarkAddress,
  BookmarksHandle,
  ScrollIntoViewInput,
  SuperDocUI,
  WorkflowScrollResult,
} from 'superdoc/ui';
import { SuperDoc } from 'superdoc';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type AssertEqual<A, B> = Equal<A, B> extends true ? true : never;

declare const ui: SuperDocUI;
declare const superdoc: SuperDoc;
const handle: BookmarksHandle = ui.bookmarks;
const _parameters: AssertEqual<
  Parameters<BookmarksHandle['navigateTo']>,
  [input: string | BookmarkAddress, options?: Pick<ScrollIntoViewInput, 'block' | 'behavior'>]
> = true;
const _returns: AssertEqual<ReturnType<BookmarksHandle['navigateTo']>, Promise<WorkflowScrollResult>> = true;
const address: BookmarkAddress = { kind: 'entity', entityType: 'bookmark', name: 'Terms' };
const named: Promise<WorkflowScrollResult> = handle.navigateTo('Terms');
const addressed: Promise<WorkflowScrollResult> = superdoc.ui.bookmarks.navigateTo(address, {
  block: 'start',
  behavior: 'instant',
});
void named;
void addressed;
// @ts-expect-error A bookmark name or canonical bookmark address is required.
handle.navigateTo({ kind: 'text', blockId: 'P1', range: { start: 0, end: 1 } });
