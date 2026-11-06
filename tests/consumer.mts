import {
  normalizeSearchText,
  searchPdfText,
  type IndexedTextRun,
  type TextSearchHit,
} from '@lp-labs/pdf-text-search';

const run: IndexedTextRun = {
  page: 0,
  text: 'A',
  glyphs: [{ text: 'A', rect: { x: 0, y: 0, width: 1, height: 1 } }],
};
const hits: readonly TextSearchHit[] = searchPdfText([run], normalizeSearchText('a'));
void hits;
