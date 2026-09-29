import type { BrowserDocumentApi, DocumentApi } from 'superdoc/ui';

declare const doc: DocumentApi;
declare const browserDoc: BrowserDocumentApi;

const input: Parameters<DocumentApi['create']['image']>[0] = {
  src: 'data:image/png;base64,abc',
  at: {
    kind: 'inContentControl',
    target: { kind: 'block', nodeType: 'sdt', nodeId: '1004' },
    position: 'start',
    replaceContent: true,
  },
};
const result: ReturnType<DocumentApi['create']['image']> = doc.create.image(input);
if (result.success) {
  const nodeId: string = result.image.nodeId;
  void nodeId;
}

const browserInput: Parameters<BrowserDocumentApi['create']['image']>[0] = input;
const browserResult: Awaited<ReturnType<BrowserDocumentApi['create']['image']>> =
  await browserDoc.create.image(browserInput);
if (browserResult.success) {
  const nodeId: string = browserResult.image.nodeId;
  void nodeId;
}

// @ts-expect-error images.move cannot resolve an inline content-control target.
doc.images.move({ imageId: 'image-1', to: input.at! });
