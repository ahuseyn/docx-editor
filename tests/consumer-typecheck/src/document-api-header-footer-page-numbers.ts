import type { DocumentApi } from 'superdoc/ui';

declare const doc: DocumentApi;

type PageNumbers = DocumentApi['headerFooters']['pageNumbers'];
type PageNumbersInsert = PageNumbers['insert'];
type PageNumbersSet = PageNumbers['set'];

const section = { kind: 'section', sectionId: 'section-0' } as const;

// Only the section and the header/footer kind are required.
const minimal: Parameters<PageNumbersInsert>[0] = { section, kind: 'footer' };

const placed: Parameters<PageNumbersInsert>[0] = {
  section: { kind: 'section', sectionId: 'section-1' },
  kind: 'header',
  alignment: 'center',
  showOnFirstPage: false,
  format: 'lowerRoman',
  start: 1,
};

const result: ReturnType<PageNumbersInsert> = doc.headerFooters.pageNumbers.insert(placed, { dryRun: true });

if (result.success) {
  // Numbered parts are part addresses, and the first-page state is reported.
  const refIds: string[] = result.parts.map((part) => part.refId);
  const titlePage: boolean = result.titlePage;
  void refIds;
  void titlePage;
} else {
  // A section that already shows a page number reports why in the failure details.
  const reason: unknown = result.failure.details;
  void reason;
}

// set adds or changes numbers; null start continues from the previous section.
const moved: Parameters<PageNumbersSet>[0] = { section, kind: 'header', start: null };
const setResult: ReturnType<PageNumbersSet> = doc.headerFooters.pageNumbers.set(moved);
if (setResult.success) {
  const kind: 'header' | 'footer' = setResult.kind;
  void kind;
}

// get reports placements, first-page visibility, and the numbering options.
const info: ReturnType<PageNumbers['get']> = doc.headerFooters.pageNumbers.get({ section });
const firstPlacement = info.placements[0];
if (firstPlacement) {
  const alignment: 'left' | 'center' | 'right' | null = firstPlacement.alignment;
  const kind: 'header' | 'footer' = firstPlacement.kind;
  void alignment;
  void kind;
}
const start: number | null = info.start;
const format: string = info.format;
const showOnFirstPage: boolean = info.showOnFirstPage;

// remove takes an optional kind and reports the parts that lost a number.
const removed: ReturnType<PageNumbers['remove']> = doc.headerFooters.pageNumbers.remove({ section, kind: 'footer' });
if (removed.success) {
  const parts: string[] = removed.parts.map((part) => part.refId);
  void parts;
}

// sections.setPageNumbering also clears the start with null.
doc.sections.setPageNumbering({ target: section, start: null });

// @ts-expect-error Alignment is limited to left, center, and right.
const justified: Parameters<PageNumbersInsert>[0] = { ...minimal, alignment: 'justify' };

// @ts-expect-error The number style is one of Word's page number formats.
const emoji: Parameters<PageNumbersSet>[0] = { section, kind: 'footer', format: 'emoji' };

void minimal;
void justified;
void emoji;
void start;
void format;
void showOnFirstPage;
