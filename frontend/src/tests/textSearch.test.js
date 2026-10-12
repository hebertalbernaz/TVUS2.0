import { findMatches } from '../lib/textSearch';

describe('findMatches', () => {
    it('ignores case and accents while keeping original offsets', () => {
        const text = 'Fígado com ecogenicidade preservada. FIGADO sem alterações.';
        const matches = findMatches(text, 'figado');
        expect(matches).toHaveLength(2);
        expect(text.slice(matches[0].start, matches[0].end)).toBe('Fígado');
        expect(text.slice(matches[1].start, matches[1].end)).toBe('FIGADO');
    });

    it('matches accented terms against unaccented text', () => {
        expect(findMatches('Alteracoes discretas', 'alterações')).toEqual([{ start: 0, end: 10 }]);
    });

    it('returns no matches for empty terms or text', () => {
        expect(findMatches('Baço', '   ')).toEqual([]);
        expect(findMatches('', 'baço')).toEqual([]);
    });
});
