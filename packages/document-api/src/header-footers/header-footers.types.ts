import type { SectionAddress, SectionPageNumberingFormat } from '../sections/sections.types.js';
import type { ReceiptFailure } from '../types/receipt.js';
import type { DiscoveryOutput } from '../types/discovery.js';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export type HeaderFooterKind = 'header' | 'footer';
export type HeaderFooterVariant = 'default' | 'first' | 'even';

// ---------------------------------------------------------------------------
// Address types
// ---------------------------------------------------------------------------

/** Targets a specific (section, kind, variant) slot. */
export interface HeaderFooterSlotAddress {
  kind: 'headerFooterSlot';
  section: SectionAddress;
  headerFooterKind: HeaderFooterKind;
  variant: HeaderFooterVariant;
}

/** Targets a specific part by relationship ID. */
export interface HeaderFooterPartAddress {
  kind: 'headerFooterPart';
  refId: string;
}

// ---------------------------------------------------------------------------
// Read model types
// ---------------------------------------------------------------------------

/** One section-slot entry (returned by list/get). */
export interface HeaderFooterSlotEntry {
  section: SectionAddress;
  sectionIndex: number;
  kind: HeaderFooterKind;
  variant: HeaderFooterVariant;
  /** The explicit refId on this section slot, or null if inherited/absent. */
  refId: string | null;
  /** True when the slot has a direct reference in the section's sectPr. */
  isExplicit: boolean;
}

/** Resolution result (returned by resolve). */
export type HeaderFooterResolveResult =
  | {
      status: 'explicit';
      refId: string;
      section: SectionAddress;
    }
  | {
      status: 'inherited';
      refId: string;
      /** The section from which the ref was inherited. */
      resolvedFromSection: SectionAddress;
      /** The variant that actually matched (may differ from requested if fell back to 'default'). */
      resolvedVariant: HeaderFooterVariant;
    }
  | {
      status: 'none';
    };

/** One unique part record (returned by parts.list). */
export interface HeaderFooterPartEntry {
  refId: string;
  kind: HeaderFooterKind;
  /** The OOXML part path, e.g. 'word/header1.xml'. */
  partPath: string;
  /** Sections that explicitly reference this part. */
  referencedBySections: SectionAddress[];
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface HeaderFootersListQuery {
  /** Filter by kind. Omit to return both headers and footers. */
  kind?: HeaderFooterKind;
  /** Filter to a single section. Omit to return all sections. */
  section?: SectionAddress;
  /** Max items to return. Omit to return all. Must be > 0 if provided. */
  limit?: number;
  /** Zero-based offset into sorted results. Defaults to 0. Must be >= 0. */
  offset?: number;
}

export type HeaderFootersListResult = DiscoveryOutput<HeaderFooterSlotEntry>;

export interface HeaderFootersGetInput {
  target: HeaderFooterSlotAddress;
}

export interface HeaderFootersResolveInput {
  target: HeaderFooterSlotAddress;
}

export interface HeaderFootersRefsSetInput {
  target: HeaderFooterSlotAddress;
  refId: string;
}

export interface HeaderFootersRefsClearInput {
  target: HeaderFooterSlotAddress;
}

export interface HeaderFootersRefsSetLinkedToPreviousInput {
  target: HeaderFooterSlotAddress;
  linked: boolean;
}

export interface HeaderFootersPartsListQuery {
  kind?: HeaderFooterKind;
  /** Max items to return. Omit to return all. Must be > 0 if provided. */
  limit?: number;
  /** Zero-based offset into sorted results. Defaults to 0. Must be >= 0. */
  offset?: number;
}

export type HeaderFootersPartsListResult = DiscoveryOutput<HeaderFooterPartEntry>;

/** Creates an independent part. Slot assignment happens separately via refs.set. */
export interface HeaderFootersPartsCreateInput {
  kind: HeaderFooterKind;
  /** Clone content from an existing part. Omit to create empty. */
  sourceRefId?: string;
}

export interface HeaderFootersPartsDeleteInput {
  target: HeaderFooterPartAddress;
}

export type HeaderFooterPageNumberAlignment = 'left' | 'center' | 'right';

/** Number style and first number of a section's pages, as Word's Format Page Numbers sets them. */
export interface HeaderFootersPageNumbersNumberingInput {
  /** Number style for the section, such as 'lowerRoman'. Omit to keep the current style. */
  format?: SectionPageNumberingFormat;
  /**
   * Number shown on the section's first page, or null to continue from the previous
   * section. Omit to keep the current setting.
   */
  start?: number | null;
}

/**
 * Numbers every page of a section with a live PAGE field in its header or footer.
 *
 * Sections linked to the same header/footer part are numbered with it. Odd/even
 * documents get the number on even pages too.
 */
export interface HeaderFootersPageNumbersInsertInput extends HeaderFootersPageNumbersNumberingInput {
  section: SectionAddress;
  /** 'header' places the number at the top of the page, 'footer' at the bottom. */
  kind: HeaderFooterKind;
  /** Alignment of the page-number paragraph. Defaults to 'right'. */
  alignment?: HeaderFooterPageNumberAlignment;
  /**
   * When false, the section's first page shows no number. Its existing header and
   * footer content stays on the first page. Defaults to true.
   */
  showOnFirstPage?: boolean;
}

/**
 * Adds page numbers to a section or changes the ones it has, in one step.
 *
 * Numbers already in the requested header or footer are realigned in place, so
 * text typed around them moves with them. A number after a tab beside other
 * text, such as a title on the left, gets its own aligned paragraph instead and
 * the text stays. Numbers in the other one are moved. Omitted options keep the
 * section's current settings.
 */
export interface HeaderFootersPageNumbersSetInput extends HeaderFootersPageNumbersNumberingInput {
  section: SectionAddress;
  /** 'header' places the number at the top of the page, 'footer' at the bottom. */
  kind: HeaderFooterKind;
  /** Alignment of the page-number paragraph. Defaults to the current alignment, or 'right'. */
  alignment?: HeaderFooterPageNumberAlignment;
  /** Whether the section's first page shows a number. Defaults to the current state, or true. */
  showOnFirstPage?: boolean;
}

export interface HeaderFootersPageNumbersRemoveInput {
  section: SectionAddress;
  /** Remove only the header's or the footer's numbers. Omit to remove both. */
  kind?: HeaderFooterKind;
}

export interface HeaderFootersPageNumbersGetInput {
  section: SectionAddress;
}

/** Where a section shows page numbers. */
export interface HeaderFooterPageNumberPlacement {
  kind: HeaderFooterKind;
  /**
   * Alignment of the paragraph holding the number, or null when it is placed some
   * other way, such as justified or with tab stops.
   */
  alignment: HeaderFooterPageNumberAlignment | null;
  /** Header/footer parts on the section's pages that show a PAGE field. */
  parts: HeaderFooterPartAddress[];
}

/** A section's page numbers, as {@link HeaderFootersPageNumbersGetInput} reads them. */
export interface HeaderFooterPageNumbersInfo {
  section: SectionAddress;
  /** Header first, then footer. Empty when the section shows no page number. */
  placements: HeaderFooterPageNumberPlacement[];
  /** Whether the section's first page shows a number. True when the section has none. */
  showOnFirstPage: boolean;
  /** Whether the section uses a distinct first page. */
  titlePage: boolean;
  format: SectionPageNumberingFormat;
  /** Number on the section's first page, or null when it continues from the previous section. */
  start: number | null;
}

// ---------------------------------------------------------------------------
// Mutation result types
// ---------------------------------------------------------------------------

export interface HeaderFooterRefsMutationSuccessResult {
  success: true;
  section: SectionAddress;
}

export interface HeaderFooterRefsMutationFailureResult {
  success: false;
  failure: ReceiptFailure;
}

export type HeaderFooterRefsMutationResult =
  | HeaderFooterRefsMutationSuccessResult
  | HeaderFooterRefsMutationFailureResult;

export interface HeaderFooterPartsMutationSuccessResult {
  success: true;
  refId: string;
  partPath: string;
}

export interface HeaderFooterPartsMutationFailureResult {
  success: false;
  failure: ReceiptFailure;
}

export type HeaderFooterPartsMutationResult =
  | HeaderFooterPartsMutationSuccessResult
  | HeaderFooterPartsMutationFailureResult;

export interface HeaderFooterPageNumbersInsertSuccessResult {
  success: true;
  section: SectionAddress;
  kind: HeaderFooterKind;
  /** Header/footer parts that received a PAGE field. */
  parts: HeaderFooterPartAddress[];
  /** Whether the section uses a distinct first page after the insert. */
  titlePage: boolean;
}

export interface HeaderFooterPageNumbersInsertFailureResult {
  success: false;
  failure: ReceiptFailure;
}

/**
 * A section whose header or footer already has a page number fails with
 * PRECONDITION_FAILED and `failure.details.reason === 'page-number-exists'`.
 */
export type HeaderFooterPageNumbersInsertResult =
  | HeaderFooterPageNumbersInsertSuccessResult
  | HeaderFooterPageNumbersInsertFailureResult;

/**
 * Moving a number, or hiding it on the first page, fails with PRECONDITION_FAILED
 * and `failure.details.reason === 'page-number-has-content'` when the number is
 * mixed into other text in its paragraph, such as "Page 1 of 10". That paragraph
 * is edited directly instead. A number after a tab beside other text, such as a
 * title on the left, moves on its own and the text stays.
 */
export type HeaderFooterPageNumbersSetResult = HeaderFooterPageNumbersInsertResult;

export interface HeaderFooterPageNumbersRemoveSuccessResult {
  success: true;
  section: SectionAddress;
  /** Header/footer parts that lost a PAGE field. */
  parts: HeaderFooterPartAddress[];
}

/** A section with no page number fails with NO_OP. */
export type HeaderFooterPageNumbersRemoveResult =
  | HeaderFooterPageNumbersRemoveSuccessResult
  | HeaderFooterPageNumbersInsertFailureResult;
