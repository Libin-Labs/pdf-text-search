import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchText, searchPdfText } from '../dist/esm/index.js';

function run(text) {
  return {
    page: 2,
    text,
    glyphs: [...text].map((character, index) => ({
      text: character,
      rect: { x: index * 8, y: 10, width: 7, height: 12 },
    })),
  };
}

test('finds case- and compatibility-normalized quotes with source glyph rectangles', () => {
  const [hit] = searchPdfText([run('Ａda LOVELACE')], 'ada love');
  assert.equal(hit.quote, 'Ａda LOVE');
  assert.equal(hit.page, 2);
  assert.equal(hit.rects.length, 8);
  assert.deepEqual(hit.rects[0], { x: 0, y: 10, width: 7, height: 12 });
});

test('returns left-to-right non-overlapping occurrences in source page order', () => {
  assert.deepEqual(
    searchPdfText([run('banana')], 'ana').map((hit) => hit.start),
    [1],
  );
  assert.equal(searchPdfText([run('banana')], 'ana', { maxHits: 1 }).length, 1);
});

test('checks glyph-to-text correspondence and geometry before returning matches', () => {
  assert.throws(() => searchPdfText([{ ...run('abc'), glyphs: run('abc').glyphs.slice(1) }], 'a'), {
    code: 'invalid',
  });
  assert.throws(
    () =>
      searchPdfText(
        [
          {
            ...run('a'),
            glyphs: [{ text: 'a', rect: { x: 0, y: 0, width: 0, height: 2 } }],
          },
        ],
        'a',
      ),
    { code: 'invalid' },
  );
});

test('normalizes query text and bounds query/result options', () => {
  assert.equal(normalizeSearchText('Straße'), 'straße');
  assert.throws(() => searchPdfText([run('abc')], ' '), { code: 'invalid' });
  assert.throws(() => searchPdfText([run('abc')], 'a', { maxHits: 20_000 }), {
    code: 'invalid',
  });
});
