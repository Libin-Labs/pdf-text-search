# @lp-labs/pdf-text-search

Searches text and per-code-point geometry supplied by a caller, returning source quotes and their
glyph rectangles. It is an index query, not PDF text extraction or OCR.

## Install and quick start

```sh
npm install @lp-labs/pdf-text-search
```

```js
import { searchPdfText } from '@lp-labs/pdf-text-search';

const run = {
  page: 0,
  text: 'Invoice 42',
  glyphs: [...'Invoice 42'].map((text, index) => ({
    text,
    rect: { x: index * 8, y: 20, width: 7, height: 12 },
  })),
};
console.log(searchPdfText([run], 'invoice'));
```

## API, types, and customization

- `IndexedTextRun` supplies a zero-based `page`, text, and one `IndexedTextGlyph` per Unicode code
  point. Every glyph carries a positive finite `TextRect`; the supplied text and glyph order must
  agree.
- `normalizeSearchText` applies Unicode NFKC and locale-independent lowercase. `searchPdfText` uses
  that normalization by default, or accepts `caseSensitive` and `maxHits` (1–10,000; default 1,000).
- Each `TextSearchHit` provides the original `quote`, half-open source offsets, page, and detached
  glyph `rects`. Matches are left-to-right and non-overlapping per run. `PdfTextSearchError` codes
  are `invalid` and `limit`.

## Interoperability and scope

Feed runs from an extraction engine that preserves glyph geometry. Search is bounded by caller input
and hit count, but scans supplied text linearly. It does not open PDFs, perform OCR, infer reading
order across runs, or account for ligature mappings that the adapter has not supplied.

ESM, CommonJS, and TypeScript declarations are included. There are no runtime or peer dependencies;
TypeScript and Prettier are development-only.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
