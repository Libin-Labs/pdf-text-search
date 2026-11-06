import { searchPdfText, type TextRect } from '@lp-labs/pdf-text-search';

const box: TextRect = { x: 0, y: 0, width: 1, height: 1 };
const hits = searchPdfText([{ page: 0, text: 'x', glyphs: [{ text: 'x', rect: box }] }], 'x');
const quote: string | undefined = hits[0]?.quote;
void quote;
