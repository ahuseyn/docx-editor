# superdoc

Browser editor for opening, editing, and rendering DOCX files.

## Install

```bash
npm install superdoc
```

## Quick start

```js
import { SuperDoc } from 'superdoc';
import 'superdoc/style.css';

const editor = new SuperDoc({
  selector: '#editor',
  document: '/document.docx',
});
```

See the [editor quick start](https://docs.superdoc.dev/editor/quickstart) for a complete example and the
[SuperDoc documentation](https://docs.superdoc.dev) for configuration and APIs.

See [package compatibility](https://docs.superdoc.dev/resources/package-compatibility) for the peer dependency policy and current-version inspection commands.

## License

AGPL-3.0. Commercial licenses are available from [SuperDoc](https://www.superdoc.dev).

## Navigate to a bookmark

After the V2 browser editor is ready, navigate by an exact bookmark name:

```js
const result = await editor.ui.bookmarks.navigateTo('Terms');
if (!result.success) console.log(result.reason);
```

You can also pass a `BookmarkAddress` returned by `editor.activeEditor.doc.bookmarks.get()`
or `.list()`. The method reveals the bookmark's start and selects its complete range,
including across paragraphs. A collapsed bookmark places a caret. It supports editing,
suggesting, and viewing modes. Navigation stays local in a shared room and does not change
content or another client's selection. It does not take native keyboard focus.

Scrolling defaults to instant, centered navigation. Pass `{ block: 'start', behavior: 'auto' }`
as a second argument to change alignment or scrolling behavior.

The first release supports body bookmarks. Non-body and table-column bookmarks, malformed,
missing, deleted, or ambiguous targets return `{ success: false, ok: false, reason: 'target-unresolved' }`.
Name-only lookup requires a unique match across the document; an explicit body address scopes
lookup to the body. Resolution or reveal failure preserves the existing selection. Navigation
abandons stale work after content changes, document replacement, or a newer request, and times
out after 15 seconds. Missing editor or host capabilities return their readiness or availability
reason. The handle and address types are exported from `superdoc/ui`.
