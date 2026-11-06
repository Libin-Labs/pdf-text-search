export interface TextRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
export interface IndexedTextGlyph {
  readonly text: string;
  readonly rect: TextRect;
}
export interface IndexedTextRun {
  readonly page: number;
  readonly text: string;
  readonly glyphs: readonly IndexedTextGlyph[];
}
export interface TextSearchHit {
  readonly page: number;
  readonly quote: string;
  readonly start: number;
  readonly end: number;
  readonly rects: readonly TextRect[];
}

export class PdfTextSearchError extends Error {
  constructor(
    readonly code: 'invalid' | 'limit',
    message: string,
  ) {
    super(message);
    this.name = 'PdfTextSearchError';
  }
}

export function normalizeSearchText(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase('und');
}

export function searchPdfText(
  runs: readonly IndexedTextRun[],
  query: string,
  options: { readonly maxHits?: number; readonly caseSensitive?: boolean } = {},
): readonly TextSearchHit[] {
  if (!query.trim()) throw new PdfTextSearchError('invalid', 'Search query cannot be empty.');
  const maxHits = options.maxHits ?? 1000;
  if (!Number.isSafeInteger(maxHits) || maxHits < 1 || maxHits > 10_000)
    throw new PdfTextSearchError('invalid', 'maxHits must be between 1 and 10,000.');
  const wanted = options.caseSensitive ? query.normalize('NFKC') : normalizeSearchText(query);
  const hits: TextSearchHit[] = [];
  for (const run of runs) {
    const glyphs = [...run.text];
    if (glyphs.length !== run.glyphs.length || !Number.isSafeInteger(run.page) || run.page < 0) {
      throw new PdfTextSearchError(
        'invalid',
        'Each supplied text code point needs one geometry glyph and a non-negative page.',
      );
    }
    const normalized: string[] = [];
    const sourceByUnit: number[] = [];
    for (let index = 0; index < glyphs.length; index += 1) {
      const actual = run.glyphs[index]!.text;
      if (actual !== glyphs[index])
        throw new PdfTextSearchError(
          'invalid',
          'Glyph text must match the corresponding supplied run code point.',
        );
      const units = (
        options.caseSensitive ? actual.normalize('NFKC') : normalizeSearchText(actual)
      ).split('');
      normalized.push(...units);
      sourceByUnit.push(...units.map(() => index));
      const box = run.glyphs[index]!.rect;
      if (
        ![box.x, box.y, box.width, box.height].every(Number.isFinite) ||
        box.width <= 0 ||
        box.height <= 0
      ) {
        throw new PdfTextSearchError('invalid', 'Glyph rectangles must be finite and positive.');
      }
    }
    const haystack = normalized.join('');
    let from = 0;
    while (hits.length < maxHits) {
      const found = haystack.indexOf(wanted, from);
      if (found < 0) break;
      const first = sourceByUnit[found]!;
      const last = sourceByUnit[found + wanted.length - 1]!;
      const rects = run.glyphs
        .slice(first, last + 1)
        .map((glyph) => Object.freeze({ ...glyph.rect }));
      hits.push({
        page: run.page,
        quote: glyphs.slice(first, last + 1).join(''),
        start: first,
        end: last + 1,
        rects,
      });
      from = found + Math.max(1, wanted.length);
    }
    if (hits.length >= maxHits) break;
  }
  if (
    hits.length === maxHits &&
    runs.some((run) => run.text.length > 0) &&
    options.maxHits !== undefined
  ) {
    return hits;
  }
  return hits;
}
