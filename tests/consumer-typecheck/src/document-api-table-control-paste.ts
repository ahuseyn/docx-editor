import type { BrowserDocumentApi, DocumentApi } from 'superdoc/ui';

declare const doc: DocumentApi;
declare const browserDoc: BrowserDocumentApi;

type PasteFragment = NonNullable<Parameters<DocumentApi['clipboard']['insert']>[0]['fragment']>;
const table: Extract<PasteFragment['blocks'][number], { kind: 'table' }> = {
  kind: 'table',
  blockSdts: [{ sourceId: '42', controlType: 'richText', alias: 'Section' }],
  rows: [{ cells: [{ blocks: [{ kind: 'paragraph', runs: [{ text: 'Cell' }] }] }] }],
};
const input: Parameters<DocumentApi['clipboard']['insert']>[0] = {
  fragment: { kind: 'superdoc.clipboard.fragment', version: 'v2.2', blocks: [table] },
  target: { kind: 'block', nodeId: 'ABC00001', placement: 'after' },
};
const receipt: ReturnType<DocumentApi['clipboard']['insert']> = doc.clipboard.insert(input);
const success: boolean = receipt.success;
const browserReceipt: Awaited<ReturnType<BrowserDocumentApi['clipboard']['insert']>> =
  await browserDoc.clipboard.insert(input);
const browserSuccess: boolean = browserReceipt.success;
void [success, browserSuccess];
