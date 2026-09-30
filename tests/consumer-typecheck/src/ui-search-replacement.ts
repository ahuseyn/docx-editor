import type { SearchController, SuperDocUIReason, WorkflowActionResult } from 'superdoc/ui';

declare const search: SearchController;
const replacement: string = 'Fiduciary';
const single: WorkflowActionResult | Promise<WorkflowActionResult> = search.replace(replacement);
const batch: WorkflowActionResult | Promise<WorkflowActionResult> = search.replaceAll(replacement);
const reason: SuperDocUIReason = 'search-truncated';
const truncated: 'search-truncated' = reason;
// @ts-expect-error replacements must be strings.
search.replaceAll(42);
void [single, batch, truncated];
