import { findMatches, buildOrganSearchIndex } from '../lib/textSearch';

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

describe('buildOrganSearchIndex (lupa do roteiro)', () => {
    const organs = [
        { organ_name: 'Fígado', report_text: 'Fígado normal. Ecotextura homogênea.' },
        { organ_name: 'Baço', report_text: 'Baço com ecotextura preservada.' },
        { organ_name: 'Rim Esquerdo', report_text: '' },
        { organ_name: 'Rim Direito', report_text: 'Sem alterações.' },
    ];

    it('lista cada ocorrência no texto em ordem do roteiro', () => {
        const { flat, stats } = buildOrganSearchIndex(organs, 'ecotextura');
        expect(flat).toEqual([{ organ: 0, index: 0 }, { organ: 1, index: 0 }]);
        expect(stats.map((s) => s.count)).toEqual([1, 1, 0, 0]);
    });

    it('encontra órgãos pelo nome mesmo sem ocorrência no texto (sem acento)', () => {
        const { flat, nameMatches } = buildOrganSearchIndex(organs, 'rim');
        expect(flat).toEqual([]);
        expect(nameMatches).toEqual([2, 3]);
    });

    it('termo vazio não gera resultados', () => {
        const { flat, nameMatches } = buildOrganSearchIndex(organs, '  ');
        expect(flat).toEqual([]);
        expect(nameMatches).toEqual([]);
    });
});
